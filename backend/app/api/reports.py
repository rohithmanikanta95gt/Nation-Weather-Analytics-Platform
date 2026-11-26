from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.database.connection import get_db
from app.database import models, schemas
from app.services.ingestion_service import process_and_save_citizen_report

router = APIRouter(prefix="/reports", tags=["Weather Reports"])


@router.get("", response_model=schemas.PaginatedReportsResponse, summary="Query and filter weather reports")
def get_reports(
    start_date: Optional[datetime] = Query(None, description="Filter reports after this ISO date"),
    end_date: Optional[datetime] = Query(None, description="Filter reports before this ISO date"),
    state: Optional[str] = Query(None, description="Indian state name (e.g. Tamil Nadu, Maharashtra)"),
    city: Optional[str] = Query(None, description="City name"),
    district: Optional[str] = Query(None, description="District or locality"),
    event_type: Optional[str] = Query(None, description="Event category (e.g. rainfall, flood, thunderstorm)"),
    verification_status: Optional[str] = Query(None, description="Status: verified, unverified, suspicious, rejected, duplicate"),
    source: Optional[str] = Query(None, description="Source: IMD, OpenWeather, Citizen Report, etc."),
    severity: Optional[str] = Query(None, description="Severity: low, moderate, high, severe, extreme"),
    search: Optional[str] = Query(None, description="Free text search in description, city, or state"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """
    Retrieve paginated weather reports with multi-dimensional filtering.
    Directly feeds the Next.js dashboard filters and table.
    """
    query = db.query(models.WeatherReport)

    if start_date:
        query = query.filter(models.WeatherReport.timestamp >= start_date)
    if end_date:
        query = query.filter(models.WeatherReport.timestamp <= end_date)
    if state and state.lower() != "all states":
        query = query.filter(func.lower(models.WeatherReport.state) == state.lower())
    if city:
        query = query.filter(models.WeatherReport.city.ilike(f"%{city.strip()}%"))
    if district:
        query = query.filter(models.WeatherReport.district.ilike(f"%{district.strip()}%"))
    if event_type and event_type.lower() != "all events":
        query = query.filter(func.lower(models.WeatherReport.event_type) == event_type.lower())
    if verification_status and verification_status.lower() != "all":
        query = query.filter(func.lower(models.WeatherReport.verification_status) == verification_status.lower())
    if source and source.lower() not in ["all", "all sources"]:
        query = query.filter(func.lower(models.WeatherReport.source) == source.lower())
    if severity and severity.lower() != "all":
        query = query.filter(func.lower(models.WeatherReport.severity) == severity.lower())
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            models.WeatherReport.description.ilike(s)
            | models.WeatherReport.city.ilike(s)
            | models.WeatherReport.state.ilike(s)
        )

    total = query.count()
    items = (
        query.order_by(desc(models.WeatherReport.timestamp))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return schemas.PaginatedReportsResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.post("", response_model=schemas.WeatherReportResponse, status_code=status.HTTP_201_CREATED, summary="Submit a citizen weather report")
async def create_citizen_report(
    report_in: schemas.CitizenReportCreate,
    db: Session = Depends(get_db),
):
    """
    Inbound report pipeline:
    1. Validation
    2. Data normalization
    3. Duplicate detection
    4. AI classification & credibility evaluation (Gemini/Groq/Rule-based)
    5. Multi-signal verification score computation
    6. Database storage
    """
    report_dict = report_in.model_dump()
    saved_report = await process_and_save_citizen_report(report_dict, db)
    return saved_report


@router.get("/map", response_model=List[schemas.WeatherMapItem], summary="Get lightweight reports for India map")
def get_map_reports(
    event_type: Optional[str] = Query(None, description="Optional event type filter"),
    db: Session = Depends(get_db),
):
    """
    Returns lightweight coordinate markers for the interactive India Weather Intelligence Map.
    """
    query = db.query(models.WeatherReport)
    if event_type and event_type.lower() != "all events":
        query = query.filter(func.lower(models.WeatherReport.event_type) == event_type.lower())

    # Return up to 300 latest geo points
    reports = query.order_by(desc(models.WeatherReport.timestamp)).limit(300).all()
    return reports


@router.get("/{report_id}", response_model=schemas.WeatherReportResponse, summary="Get full details for a single report")
def get_report_by_id(
    report_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve complete metadata, AI confidence, and verification reasoning for a report ID.
    """
    report = db.query(models.WeatherReport).filter(models.WeatherReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Weather report #{report_id} not found.")
    return report
