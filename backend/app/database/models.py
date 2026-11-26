from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
)
from app.database.connection import Base


class WeatherReport(Base):
    __tablename__ = "weather_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source = Column(String(50), nullable=False, default="Citizen Report", index=True)
    source_report_id = Column(String(100), nullable=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    country = Column(String(50), default="India", nullable=False)
    state = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    event_type = Column(
        String(50),
        nullable=False,
        default="other",
        index=True,
    )  # rainfall, thunderstorm, flood, heatwave, fog, dust_storm, strong_wind, cyclone, other

    description = Column(Text, nullable=False)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)  # in mm
    wind_speed = Column(Float, nullable=True)  # in km/h
    
    severity = Column(
        String(20),
        nullable=False,
        default="moderate",
        index=True,
    )  # low, moderate, high, severe, extreme

    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    original_text = Column(Text, nullable=True)
    
    verification_status = Column(
        String(20),
        nullable=False,
        default="unverified",
        index=True,
    )  # verified, unverified, suspicious, rejected, duplicate

    verification_score = Column(Float, default=0.5, nullable=False)
    verification_reason = Column(Text, nullable=True)
    ai_confidence = Column(Float, default=0.0, nullable=False)
    duplicate_probability = Column(Float, default=0.0, nullable=False)
    is_duplicate = Column(Boolean, default=False, nullable=False, index=True)
    duplicate_of_id = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("idx_report_coords", "latitude", "longitude"),
        Index("idx_report_time_event", "timestamp", "event_type"),
    )


class WeatherAlert(Base):
    __tablename__ = "weather_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    alert_code = Column(String(50), unique=True, index=True, nullable=False)
    event_type = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)  # warning, moderate, high, severe
    location = Column(String(150), nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    source = Column(String(100), nullable=False)
    advisory_action = Column(Text, nullable=True)
    affected_population = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)


class DataSourceStatus(Base):
    __tablename__ = "data_source_status"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source = Column(String(50), unique=True, nullable=False, index=True)
    status = Column(String(20), nullable=False, default="online")  # online, streaming, delayed, not_configured, error
    last_sync = Column(DateTime, nullable=True)
    records_received = Column(Integer, default=0, nullable=False)
    latency_ms = Column(Float, default=0.0, nullable=False)
    error_message = Column(Text, nullable=True)
    endpoint = Column(String(255), nullable=True)
