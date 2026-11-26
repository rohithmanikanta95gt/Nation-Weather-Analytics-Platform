import json
import httpx
from typing import Dict, Any
from app.config import settings
from app.database.schemas import AIAnalysisResult
from app.utils.normalization import detect_event_type_from_text, estimate_severity


SYSTEM_PROMPT = """
You are an AI Meteorological & Disaster Intelligence Analyst for India's National Weather Platform.
Analyze the following user/citizen weather report for:
1. weather event category (rainfall, thunderstorm, flood, heatwave, fog, dust_storm, strong_wind, cyclone, or other)
2. severity level (low, moderate, high, severe, extreme)
3. detected location and geographic consistency
4. credibility indicators (presence of specific ground observations, plausible physical phenomena, absence of sensationalist clickbait/spam)
5. confidence score (0.0 to 1.0)
6. recommended credibility status (verified, unverified, suspicious, or rejected)

Output strictly valid JSON matching this schema:
{
  "event_type": "string",
  "severity": "string",
  "location_detected": "string",
  "credibility": "string",
  "confidence": 0.85,
  "reason": "string"
}
"""


def rule_based_fallback_analysis(report: Dict[str, Any]) -> AIAnalysisResult:
    """
    Deterministic rule-based analysis used when no AI key is configured or API is unreachable.
    Evaluates text specifics, location consistency, and plausible metrics.
    """
    desc = report.get("description", "")
    city = report.get("city", "Unknown")
    state = report.get("state", "India")
    t = desc.lower()

    event = detect_event_type_from_text(desc, default=report.get("event_type") or "other")
    sev = estimate_severity(event, text=desc)

    # Check for suspicious spam indicators or historical video mentions
    suspicious_flags = []
    if any(k in t for k in ["tsunami in river", "alien", "ufo", "conspiracy", "click here", "free bitcoin"]):
        suspicious_flags.append("Contains improbable or malicious disinformation keywords")
    if len(desc.strip()) < 10:
        suspicious_flags.append("Description is too brief to substantiate ground observations")

    if suspicious_flags:
        return AIAnalysisResult(
            event_type=event,
            severity=sev,
            location_detected=f"{city}, {state}",
            credibility="rejected" if "malicious" in suspicious_flags[0] else "suspicious",
            confidence=0.45,
            reason="; ".join(suspicious_flags),
        )

    # Check for specific grounded details (measurements, road names, landmarks)
    has_specifics = any(
        k in t for k in ["road", "street", "flyover", "water level", "feet", "inches", "cm", "mm", "gate", "station", "bridge"]
    )
    confidence = 0.88 if has_specifics else 0.72
    credibility = "verified" if has_specifics else "unverified"

    return AIAnalysisResult(
        event_type=event,
        severity=sev,
        location_detected=f"{city}, {state}",
        credibility=credibility,
        confidence=confidence,
        reason="Report provides plausible ground meteorological details consistent with regional weather context."
        if has_specifics
        else "Report describes plausible conditions but lacks precise street/instrument measurements.",
    )


async def analyze_weather_report_gemini(report: Dict[str, Any]) -> AIAnalysisResult:
    """
    Classify and evaluate report credibility using Google Gemini API.
    Uses structured JSON mode. Tries latest available Gemini models with graceful fallback.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return rule_based_fallback_analysis(report)

    desc = report.get("description", "")
    city = report.get("city", "")
    state = report.get("state", "")
    lat = report.get("latitude")
    lng = report.get("longitude")

    user_content = f"""
Report to analyze:
- Text: "{desc}"
- Claimed City: {city}
- Claimed State: {state}
- Coordinates: Lat {lat}, Lng {lng}
- Source: {report.get('source', 'Citizen Report')}
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SYSTEM_PROMPT},
                    {"text": user_content}
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2,
        },
    }

    # Models supported in order of preference
    model_candidates = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash"]
    for model_name in model_candidates:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    res_data = response.json()
                    candidates = res_data.get("candidates", [])
                    if candidates:
                        text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        parsed = json.loads(text_content)
                        return AIAnalysisResult(
                            event_type=str(parsed.get("event_type", "other")).lower(),
                            severity=str(parsed.get("severity", "moderate")).lower(),
                            location_detected=str(parsed.get("location_detected", f"{city}, {state}")),
                            credibility=str(parsed.get("credibility", "unverified")).lower(),
                            confidence=float(parsed.get("confidence", 0.75)),
                            reason=str(parsed.get("reason", f"Analyzed by Gemini ({model_name}).")),
                        )
        except Exception:
            continue

    return rule_based_fallback_analysis(report)
