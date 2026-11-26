from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.connection import get_db
from app.database import models, schemas

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=schemas.AnalyticsSummary, summary="Dashboard KPI metrics summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """
    High-level platform KPIs for the dashboard cards.
    """
    total = db.query(func.count(models.WeatherReport.id)).scalar() or 0
    verified = (
        db.query(func.count(models.WeatherReport.id))
        .filter(models.WeatherReport.verification_status == "verified")
        .scalar()
        or 0
    )
    unverified = (
        db.query(func.count(models.WeatherReport.id))
        .filter(models.WeatherReport.verification_status == "unverified")
        .scalar()
        or 0
    )
    suspicious = (
        db.query(func.count(models.WeatherReport.id))
        .filter(models.WeatherReport.verification_status == "suspicious")
        .scalar()
        or 0
    )
    duplicate = (
        db.query(func.count(models.WeatherReport.id))
        .filter(models.WeatherReport.is_duplicate == True)
        .scalar()
        or 0
    )

    active_alerts = (
        db.query(func.count(models.WeatherAlert.id))
        .filter(models.WeatherAlert.is_active == True)
        .scalar()
        or 0
    )

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    reports_today = (
        db.query(func.count(models.WeatherReport.id))
        .filter(models.WeatherReport.created_at >= today_start)
        .scalar()
        or 0
    )

    return schemas.AnalyticsSummary(
        total_reports=total,
        verified_reports=verified,
        unverified_reports=unverified,
        suspicious_reports=suspicious,
        duplicate_reports=duplicate,
        active_alerts=active_alerts,
        reports_today=reports_today,
    )


@router.get("/events", response_model=List[schemas.EventDistributionItem], summary="Event category distribution")
def get_event_distribution(db: Session = Depends(get_db)):
    """
    Categorical breakdown of reports for the Donut/Pie chart.
    """
    total = db.query(func.count(models.WeatherReport.id)).scalar() or 1

    rows = (
        db.query(
            models.WeatherReport.event_type,
            func.count(models.WeatherReport.id).label("count"),
        )
        .group_by(models.WeatherReport.event_type)
        .order_by(func.count(models.WeatherReport.id).desc())
        .all()
    )

    results = []
    for r in rows:
        pct = round((r.count / total) * 100, 1)
        results.append(
            schemas.EventDistributionItem(
                event_type=r.event_type.capitalize().replace("_", " "),
                count=r.count,
                percentage=pct,
            )
        )
    return results


@router.get("/states", response_model=List[schemas.StateAnalyticsItem], summary="State-wise incident counts")
def get_state_analytics(db: Session = Depends(get_db)):
    """
    State-level volume comparison for the State-wise horizontal bar chart.
    """
    rows = (
        db.query(
            models.WeatherReport.state,
            func.count(models.WeatherReport.id).label("total"),
            func.sum(
                func.case((models.WeatherReport.event_type == "flood", 1), else_=0)
            ).label("flood_count"),
        )
        .group_by(models.WeatherReport.state)
        .order_by(func.count(models.WeatherReport.id).desc())
        .limit(12)
        .all()
    )

    results = []
    for r in rows:
        # Count active alerts in this state
        alert_cnt = (
            db.query(func.count(models.WeatherAlert.id))
            .filter(
                models.WeatherAlert.state == r.state,
                models.WeatherAlert.is_active == True,
            )
            .scalar()
            or 0
        )
        results.append(
            schemas.StateAnalyticsItem(
                state=r.state,
                count=r.total,
                flood_count=int(r.flood_count or 0),
                alerts_count=alert_cnt,
            )
        )
    return results


@router.get("/timeline", response_model=List[schemas.TimelineItem], summary="Time-series influx trend")
def get_timeline_analytics(
    days: int = 7,
    db: Session = Depends(get_db),
):
    """
    Time-series data for Reports Over Time area chart.
    Groups counts by day for the last N days.
    """
    results = []
    now = datetime.utcnow()

    for i in range(days - 1, -1, -1):
        target_day = now - timedelta(days=i)
        day_str = target_day.strftime("%a")
        d_start = target_day.replace(hour=0, minute=0, second=0, microsecond=0)
        d_end = target_day.replace(hour=23, minute=59, second=59, microsecond=999999)

        rep_count = (
            db.query(func.count(models.WeatherReport.id))
            .filter(
                models.WeatherReport.timestamp >= d_start,
                models.WeatherReport.timestamp <= d_end,
            )
            .scalar()
            or 0
        )

        ver_count = (
            db.query(func.count(models.WeatherReport.id))
            .filter(
                models.WeatherReport.timestamp >= d_start,
                models.WeatherReport.timestamp <= d_end,
                models.WeatherReport.verification_status == "verified",
            )
            .scalar()
            or 0
        )

        results.append(
            schemas.TimelineItem(
                period=day_str,
                reports=rep_count,
                verified=ver_count,
            )
        )

    return results


@router.get("/verification", response_model=schemas.VerificationAnalytics, summary="Verification breakdown stats")
def get_verification_analytics(db: Session = Depends(get_db)):
    """
    Breakdown of reports across verification statuses.
    """
    def get_cnt(status_str: str) -> int:
        return (
            db.query(func.count(models.WeatherReport.id))
            .filter(models.WeatherReport.verification_status == status_str)
            .scalar()
            or 0
        )

    return schemas.VerificationAnalytics(
        verified=get_cnt("verified"),
        unverified=get_cnt("unverified"),
        suspicious=get_cnt("suspicious"),
        rejected=get_cnt("rejected"),
        duplicate=get_cnt("duplicate"),
    )
