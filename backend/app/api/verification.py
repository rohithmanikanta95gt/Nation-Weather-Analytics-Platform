from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database import models, schemas
from app.services.ingestion_service import run_background_ingestion

router = APIRouter(tags=["Verification & Data Sources"])


@router.post("/verify/{report_id}", response_model=schemas.WeatherReportResponse, summary="Manually verify, reject, or flag a report")
def update_report_verification(
    report_id: int,
    verif_in: schemas.ManualVerificationRequest,
    db: Session = Depends(get_db),
):
    """
    Moderator endpoint to transition a report status to verified, rejected, suspicious, or duplicate.
    Updates the verification history and reason.
    """
    report = db.query(models.WeatherReport).filter(models.WeatherReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Report #{report_id} not found.")

    report.verification_status = verif_in.verification_status
    if verif_in.verification_reason:
        report.verification_reason = verif_in.verification_reason
    if verif_in.verification_status == "duplicate":
        report.is_duplicate = True

    report.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(report)
    return report


@router.get("/sources/status", response_model=List[schemas.DataSourceStatusResponse], summary="Data source health and sync status")
def get_sources_status(db: Session = Depends(get_db)):
    """
    Returns telemetry stream health for IMD, OpenWeather, Open-Meteo, Social Media, and Citizen portals.
    Powers the frontend's 'Data Source Health' section.
    """
    # Ensure default status records exist if fresh DB
    defaults = [
        {"source": "Open-Meteo", "status": "online", "endpoint": "api.open-meteo.com/v1/forecast", "latency": 45.0, "recs": 2400},
        {"source": "OpenWeather", "status": "online", "endpoint": "api.openweathermap.org/data/2.5", "latency": 115.0, "recs": 1800},
        {"source": "Social Media (NLP)", "status": "streaming", "endpoint": "stream.nwap.gov.in/social/feed", "latency": 180.0, "recs": 3204},
        {"source": "Citizen Reports", "status": "delayed", "endpoint": "citizen.nwap.gov.in/api/v1/reports", "latency": 340.0, "recs": 1521},
        {"source": "IMD", "status": "not_configured", "endpoint": "api.imd.gov.in/v2/telemetry", "latency": 0.0, "recs": 0},
    ]

    for d in defaults:
        existing = db.query(models.DataSourceStatus).filter_by(source=d["source"]).first()
        if not existing:
            rec = models.DataSourceStatus(
                source=d["source"],
                status=d["status"],
                endpoint=d["endpoint"],
                latency_ms=d["latency"],
                records_received=d["recs"],
                last_sync=datetime.utcnow(),
            )
            db.add(rec)
    db.commit()

    statuses = db.query(models.DataSourceStatus).all()
    return statuses


@router.post("/ingestion/run", summary="Trigger manual data ingestion run")
async def trigger_ingestion(db: Session = Depends(get_db)):
    """
    Allows the demo operator to manually trigger data collection and normalization.
    """
    result = await run_background_ingestion(db)
    return {
        "status": "success",
        "message": "Manual data ingestion pipeline executed successfully.",
        "details": result,
    }
