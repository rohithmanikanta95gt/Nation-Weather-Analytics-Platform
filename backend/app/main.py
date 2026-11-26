import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database.connection import init_db
from app.scheduler import start_scheduler, stop_scheduler

from app.api.weather import router as weather_router
from app.api.reports import router as reports_router
from app.api.alerts import router as alerts_router
from app.api.analytics import router as analytics_router
from app.api.verification import router as verification_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Background Ingestion Scheduler
    init_db()
    logging.info("SQLite database tables initialized successfully.")
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()


app = FastAPI(
    title="National Weather Big Data Analytics Platform API",
    description="""
### NWAP-India Intermediate Backend (SIH Prototype)

A centralized meteorological intelligence and disaster-management REST API:
* **Ingestion**: Ingests weather telemetry from Open-Meteo, OpenWeather, and IMD endpoints.
* **Citizen Reports**: Validates, normalizes, and classifies crowdsourced weather reports.
* **AI Analysis**: Multi-modal evaluation via Google Gemini API / Groq LLM / Rule-based engine.
* **Duplicate Detection**: TF-IDF & geospatial cluster matching.
* **Analytics**: Time-series, regional distributions, and live alert feeds for the Next.js frontend.
""",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware configured for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(weather_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(verification_router, prefix="/api")


@app.get("/", summary="Health & API Metadata")
def root_status():
    return {
        "status": "online",
        "service": "National Weather Big Data Analytics Platform (NWAP-India)",
        "version": "1.0.0",
        "documentation": "/docs",
        "ai_provider": settings.AI_PROVIDER,
        "database": "SQLite (weather.db)",
        "cors_allowed_origins": settings.cors_origins_list,
    }
