import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.connection import get_db
from app.database import models, schemas

router = APIRouter(prefix="/alerts", tags=["Live Alerts"])


@router.get("", response_model=List[schemas.WeatherAlertResponse], summary="Retrieve active disaster and weather alerts")
def get_alerts(
    is_active: bool = Query(True, description="Filter only active alerts"),
    severity: Optional[str] = Query(None, description="Filter by severity level (severe, high, moderate)"),
    state: Optional[str] = Query(None, description="Filter by state"),
    db: Session = Depends(get_db),
):
    """
    Returns active emergency weather alerts across India issued by IMD, CWC, or NDMA.
    """
    query = db.query(models.WeatherAlert).filter(models.WeatherAlert.is_active == is_active)

    if severity and severity.lower() != "all":
        query = query.filter(models.WeatherAlert.severity.ilike(severity.strip()))
    if state and state.lower() != "all states":
        query = query.filter(models.WeatherAlert.state.ilike(f"%{state.strip()}%"))

    alerts = query.order_by(desc(models.WeatherAlert.issued_at)).all()
    return alerts


@router.post("", response_model=schemas.WeatherAlertResponse, status_code=status.HTTP_201_CREATED, summary="Broadcast emergency disaster advisory")
def broadcast_alert(
    alert_in: schemas.AlertCreate,
    db: Session = Depends(get_db),
):
    """
    Broadcast a new emergency weather warning bulletin across national feeds.
    """
    code = alert_in.alert_code or f"ALT-IN-{uuid.uuid4().hex[:6].upper()}"
    new_alert = models.WeatherAlert(
        alert_code=code,
        event_type=alert_in.event_type,
        severity=alert_in.severity,
        location=alert_in.location,
        district=alert_in.district,
        state=alert_in.state,
        description=alert_in.description,
        source=alert_in.source,
        advisory_action=alert_in.advisory_action,
        affected_population=alert_in.affected_population,
        latitude=alert_in.latitude,
        longitude=alert_in.longitude,
        issued_at=datetime.utcnow(),
        expires_at=alert_in.expires_at,
        is_active=True,
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert
