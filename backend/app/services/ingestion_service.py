import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.database import models
from app.services.openmeteo_service import get_current_weather
from app.services.openweather_service import get_openweather_current_weather
from app.services.gemini_service import analyze_weather_report_gemini
from app.services.groq_service import analyze_weather_report_groq
from app.services.duplicate_service import calculate_duplicate_probability
from app.utils.normalization import (
    normalize_openmeteo_data,
    normalize_openweather_data,
    detect_event_type_from_text,
    estimate_severity,
)
from app.utils.helpers import INDIAN_CITIES_COORDINATES

logger = logging.getLogger("ingestion")


# Key Indian target hubs for periodic polling
TARGET_INDIAN_HUBS = [
    {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"city": "Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    {"city": "Guwahati", "state": "Assam", "lat": 26.1445, "lng": 91.7362},
    {"city": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714},
    {"city": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    {"city": "Kochi", "state": "Kerala", "lat": 9.9312, "lng": 76.2673},
]


def calculate_verification_composite(
    source: str,
    ai_credibility: str,
    ai_confidence: float,
    duplicate_prob: float,
    has_weather_alignment: bool,
) -> tuple[str, float, str]:
    """
    Implements Section 9 multi-signal credibility scoring:
    source reliability + AI classification + location consistency +
    weather API comparison + duplicate similarity + report metadata.
    """
    # 1. Source Trust
    source_trust = 0.50
    if source in ["IMD", "Open-Meteo", "OpenWeather", "CWC"]:
        source_trust = 0.95
    elif source == "Citizen Report":
        source_trust = 0.65
    elif source == "Social Media":
        source_trust = 0.45

    # 2. AI Signal
    ai_weight = 0.50
    if ai_credibility == "verified":
        ai_weight = 0.85
    elif ai_credibility == "unverified":
        ai_weight = 0.60
    elif ai_credibility == "suspicious":
        ai_weight = 0.35
    elif ai_credibility == "rejected":
        ai_weight = 0.15

    # 3. Weather API alignment
    weather_signal = 0.85 if has_weather_alignment else 0.50

    # 4. Duplicate penalty
    duplicate_penalty = duplicate_prob * 0.40

    composite_score = round(
        (source_trust * 0.35)
        + (ai_weight * 0.35)
        + (ai_confidence * 0.15)
        + (weather_signal * 0.15)
        - duplicate_penalty,
        2,
    )
    composite_score = max(0.05, min(0.99, composite_score))

    if duplicate_prob >= settings.DUPLICATE_SIMILARITY_THRESHOLD:
        status = "duplicate"
        reason = f"High similarity ({int(duplicate_prob * 100)}%) with prior recent report in locality."
    elif composite_score >= 0.75:
        status = "verified"
        reason = "High multi-signal credibility supported by AI analysis and consistent physical parameters."
    elif composite_score >= 0.50:
        status = "unverified"
        reason = "Plausible report pending additional sensor corroboration."
    elif composite_score >= 0.30:
        status = "suspicious"
        reason = "Flagged due to conflicting observations or ambiguous language."
    else:
        status = "rejected"
        reason = "Rejected due to improbable claims, severe metadata conflicts, or disinformation."

    return (status, composite_score, reason)


async def dispatch_ai_analysis(report_data: Dict[str, Any]):
    """Delegate to configured AI provider or fallback."""
    provider = settings.AI_PROVIDER.lower()
    if provider == "groq":
        return await analyze_weather_report_groq(report_data)
    elif provider == "gemini":
        return await analyze_weather_report_gemini(report_data)
    else:
        from app.services.gemini_service import rule_based_fallback_analysis
        return rule_based_fallback_analysis(report_data)


async def process_and_save_citizen_report(
    report_dict: Dict[str, Any],
    db: Session,
) -> models.WeatherReport:
    """
    Full pipeline for new citizen report:
    1. Text classification & severity
    2. Duplicate detection against recent reports in area
    3. AI evaluation
    4. Weather API cross-reference check
    5. Multi-signal verification score computation
    6. Save to DB
    """
    desc = report_dict.get("description", "")
    event_type = report_dict.get("event_type") or detect_event_type_from_text(desc)
    severity = estimate_severity(event_type, text=desc)
    lat = float(report_dict.get("latitude", 0.0))
    lng = float(report_dict.get("longitude", 0.0))

    report_dict["event_type"] = event_type
    report_dict["severity"] = severity

    # 1. Fetch recent reports (last 24 hours) for deduplication
    cutoff = datetime.utcnow() - timedelta(hours=24)
    recent_db_reports = (
        db.query(models.WeatherReport)
        .filter(models.WeatherReport.created_at >= cutoff)
        .all()
    )
    recent_dicts = [
        {
            "id": r.id,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "description": r.description,
            "event_type": r.event_type,
            "timestamp": r.timestamp,
        }
        for r in recent_db_reports
    ]

    dup_prob, matched_id, is_duplicate = calculate_duplicate_probability(
        report_dict, recent_dicts
    )

    # 2. AI Analysis
    ai_result = await dispatch_ai_analysis(report_dict)

    # 3. Check real-time weather alignment from Open-Meteo
    weather_aligned = True
    try:
        live_w = await get_current_weather(lat, lng)
        w_code = live_w.get("weather_code")
        # If user claims extreme flood or thunderstorm but weather is totally clear
        if event_type in ["flood", "thunderstorm"] and w_code == 0:
            weather_aligned = False
    except Exception:
        pass

    # 4. Composite verification
    status, score, reason = calculate_verification_composite(
        source=report_dict.get("source", "Citizen Report"),
        ai_credibility=ai_result.credibility,
        ai_confidence=ai_result.confidence,
        duplicate_prob=dup_prob,
        has_weather_alignment=weather_aligned,
    )

    if is_duplicate:
        status = "duplicate"

    db_report = models.WeatherReport(
        source=report_dict.get("source", "Citizen Report"),
        source_report_id=report_dict.get("source_report_id"),
        timestamp=report_dict.get("timestamp") or datetime.utcnow(),
        country="India",
        state=report_dict.get("state", "India"),
        city=report_dict.get("city", "Unknown"),
        district=report_dict.get("district"),
        latitude=lat,
        longitude=lng,
        event_type=ai_result.event_type if ai_result.event_type != "other" else event_type,
        description=desc,
        severity=ai_result.severity if ai_result.severity else severity,
        image_url=report_dict.get("image_url"),
        video_url=report_dict.get("video_url"),
        original_text=desc,
        verification_status=status,
        verification_score=score,
        verification_reason=f"{reason} AI Note: {ai_result.reason}",
        ai_confidence=round(ai_result.confidence, 2),
        duplicate_probability=dup_prob,
        is_duplicate=is_duplicate,
        duplicate_of_id=matched_id,
    )

    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


async def run_background_ingestion(db: Session) -> Dict[str, Any]:
    """
    Fetch live Open-Meteo and OpenWeather reports across major Indian hubs,
    normalize, and store into the database. Updates data source status.
    """
    openmeteo_count = 0
    openweather_count = 0

    # Ingest from Open-Meteo
    for hub in TARGET_INDIAN_HUBS:
        try:
            raw_w = await get_current_weather(hub["lat"], hub["lng"])
            if raw_w.get("status") == "success":
                norm = normalize_openmeteo_data(
                    raw_json=raw_w["raw"],
                    city=hub["city"],
                    state=hub["state"],
                )
                report = models.WeatherReport(**norm)
                db.add(report)
                openmeteo_count += 1
        except Exception as e:
            logger.warning(f"Open-Meteo sync failed for {hub['city']}: {e}")

    # Update Open-Meteo status log
    om_status = db.query(models.DataSourceStatus).filter_by(source="Open-Meteo").first()
    if not om_status:
        om_status = models.DataSourceStatus(source="Open-Meteo")
        db.add(om_status)
    om_status.status = "online"
    om_status.last_sync = datetime.utcnow()
    om_status.records_received += openmeteo_count
    om_status.latency_ms = 45.0
    om_status.endpoint = "api.open-meteo.com/v1/forecast"

    # Ingest from OpenWeather if key configured
    if settings.OPENWEATHER_API_KEY:
        for hub in TARGET_INDIAN_HUBS[:3]:  # Top 3 to conserve API quota
            try:
                res = await get_openweather_current_weather(hub["lat"], hub["lng"])
                if res.get("status") == "success":
                    norm_ow = normalize_openweather_data(
                        raw_json=res["data"],
                        city=hub["city"],
                        state=hub["state"],
                    )
                    db.add(models.WeatherReport(**norm_ow))
                    openweather_count += 1
            except Exception as e:
                logger.warning(f"OpenWeather sync failed for {hub['city']}: {e}")

    ow_status = db.query(models.DataSourceStatus).filter_by(source="OpenWeather").first()
    if not ow_status:
        ow_status = models.DataSourceStatus(source="OpenWeather")
        db.add(ow_status)
    ow_status.status = "online" if settings.OPENWEATHER_API_KEY else "not_configured"
    ow_status.last_sync = datetime.utcnow() if settings.OPENWEATHER_API_KEY else None
    ow_status.records_received += openweather_count
    ow_status.latency_ms = 95.0 if settings.OPENWEATHER_API_KEY else 0.0
    ow_status.endpoint = "api.openweathermap.org/data/2.5/weather"

    # Update IMD Status log
    imd_status = db.query(models.DataSourceStatus).filter_by(source="IMD").first()
    if not imd_status:
        imd_status = models.DataSourceStatus(
            source="IMD",
            status="not_configured" if not settings.IMD_API_KEY else "online",
            records_received=0,
            endpoint="api.imd.gov.in/v2",
        )
        db.add(imd_status)

    db.commit()

    return {
        "status": "success",
        "openmeteo_records": openmeteo_count,
        "openweather_records": openweather_count,
        "timestamp": datetime.utcnow().isoformat(),
    }
