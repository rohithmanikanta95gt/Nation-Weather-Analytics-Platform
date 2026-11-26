from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


# Citizen Report Submission Schema
class CitizenReportCreate(BaseModel):
    description: str = Field(..., min_length=3, description="Observation narrative / report description")
    city: str = Field(..., min_length=1, description="City name")
    state: str = Field(..., min_length=1, description="Indian State or Union Territory")
    district: Optional[str] = Field(None, description="District or locality name")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow, description="Time of event occurrence")
    image_url: Optional[str] = Field(None, description="Attached evidence photo URL")
    video_url: Optional[str] = Field(None, description="Attached video URL")
    event_type: Optional[str] = Field(None, description="Optional user-selected event category")
    source: Optional[str] = Field("Citizen Report", description="Source of the report")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "description": "Very heavy rain and water entering roads, traffic stalled",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "district": "T. Nagar",
            "latitude": 13.0827,
            "longitude": 80.2707,
            "timestamp": "2026-09-29T18:30:00",
            "image_url": None
        }
    })


# Full Weather Report Response
class WeatherReportResponse(BaseModel):
    id: int
    source: str
    source_report_id: Optional[str] = None
    timestamp: datetime
    country: str
    state: str
    city: str
    district: Optional[str] = None
    latitude: float
    longitude: float
    event_type: str
    description: str
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    wind_speed: Optional[float] = None
    severity: str
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    original_text: Optional[str] = None
    verification_status: str
    verification_score: float
    verification_reason: Optional[str] = None
    ai_confidence: float
    duplicate_probability: float
    is_duplicate: bool
    duplicate_of_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Paginated Reports List Response
class PaginatedReportsResponse(BaseModel):
    items: List[WeatherReportResponse]
    total: int
    page: int
    limit: int


# Lightweight Map Point for Geo Intelligence
class WeatherMapItem(BaseModel):
    id: int
    latitude: float
    longitude: float
    city: str
    state: str
    event_type: str
    severity: str
    verification_status: str
    rainfall: Optional[float] = None
    temperature: Optional[float] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# Weather Alert Schemas
class AlertCreate(BaseModel):
    alert_code: Optional[str] = None
    event_type: str
    severity: str  # warning, moderate, high, severe
    location: str
    district: Optional[str] = None
    state: str
    description: str
    source: str = "National Disaster Management Authority (NDMA)"
    advisory_action: Optional[str] = None
    affected_population: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    expires_at: Optional[datetime] = None


class WeatherAlertResponse(BaseModel):
    id: int
    alert_code: str
    event_type: str
    severity: str
    location: str
    district: Optional[str] = None
    state: str
    description: str
    source: str
    advisory_action: Optional[str] = None
    affected_population: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    issued_at: datetime
    expires_at: Optional[datetime] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


# Analytics Schemas
class AnalyticsSummary(BaseModel):
    total_reports: int
    verified_reports: int
    unverified_reports: int
    suspicious_reports: int
    duplicate_reports: int
    active_alerts: int
    reports_today: int


class EventDistributionItem(BaseModel):
    event_type: str
    count: int
    percentage: float


class StateAnalyticsItem(BaseModel):
    state: str
    count: int
    flood_count: int
    alerts_count: int


class TimelineItem(BaseModel):
    period: str
    reports: int
    verified: int


class VerificationAnalytics(BaseModel):
    verified: int
    unverified: int
    suspicious: int
    rejected: int
    duplicate: int


# Data Source Status Schema
class DataSourceStatusResponse(BaseModel):
    source: str
    status: str
    last_sync: Optional[datetime] = None
    records_received: int
    latency_ms: Optional[float] = None
    endpoint: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Manual Verification Schema
class ManualVerificationRequest(BaseModel):
    verification_status: str = Field(..., pattern="^(verified|unverified|suspicious|rejected|duplicate)$")
    verification_reason: Optional[str] = None


# AI Analysis Response
class AIAnalysisResult(BaseModel):
    event_type: str
    severity: str
    location_detected: str
    credibility: str  # verified | unverified | suspicious | rejected
    confidence: float
    reason: str
