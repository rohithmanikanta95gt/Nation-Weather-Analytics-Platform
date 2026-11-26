# National Weather Big Data Analytics Platform (NWAP-India) — Backend

Intermediate Python + FastAPI backend for the **National Weather Big Data Analytics Platform**. Designed as a college / Smart India Hackathon (SIH) prototype for real-time weather data monitoring, multi-signal credibility verification, duplicate detection, and disaster alert telemetry.

---

## 1. Project Overview

The backend acts as the central data ingestion and intelligence hub for Indian weather monitoring. It:
* Ingests real-time weather observations from external APIs (**Open-Meteo**, **OpenWeather**, and **IMD**).
* Accepts citizen weather observations and crowdsourced reports via REST API.
* Normalizes multi-source data into a standardized `WeatherReport` schema.
* Runs automated **Duplicate Detection** using composite text similarity (TF-IDF/cosine) and geospatial proximity (< 15km).
* Performs AI classification and credibility scoring via **Google Gemini API** (with Groq option and deterministic rule-based fallback).
* Computes multi-signal trust scores without false claims of scientific truth detection.
* Serves analytics, map points, active alerts, and telemetry feeds consumed directly by the Next.js dashboard.

---

## 2. System Architecture

```text
External Weather APIs / Citizen Reports / Public Feeds
                          │
                          ▼
            [ Data Ingestion Engine ]
         (Open-Meteo, OpenWeather, IMD)
                          │
                          ▼
             [ Data Normalization ]
    (Standardized Events, Units, Coordinates)
                          │
                          ▼
          [ Duplicate Detection Service ]
        (TF-IDF Cosine + Haversine Radius)
                          │
                          ▼
          [ AI Credibility Analysis ]
   (Gemini API / Groq LLM / Rule Engine)
                          │
                          ▼
       [ Multi-Signal Verification Scoring ]
  (Source Trust + AI Confidence + Geo/Time Match)
                          │
                          ▼
            [ SQLite / PostgreSQL DB ]
                          │
                          ▼
              [ FastAPI REST API ]
   (/weather, /reports, /alerts, /analytics, /sources)
                          │
                          ▼
           [ Next.js 14+ Frontend Dashboard ]
```

---

## 3. Technology Stack & Requirements

* **Python**: 3.11+ (Python 3.13 supported)
* **Framework**: FastAPI + Uvicorn
* **Database**: SQLite (`weather.db`) with PostgreSQL-ready SQLAlchemy ORM models
* **Validation**: Pydantic v2 + Pydantic-Settings
* **HTTP Client**: HTTPX (async client with configurable timeouts)
* **Task Scheduler**: APScheduler (lightweight background polling)
* **NLP & Deduplication**: Scikit-Learn (TF-IDF vectorizer + Cosine similarity)
* **AI Providers**: Google Gemini API (default) with Groq API alternative

---

## 4. Installation & Setup

### A. Create Virtual Environment
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
```

### B. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 5. Environment Variables (`.env`)

Copy the example file to `.env`:
```bash
cp .env.example .env
```

Configuration parameters:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `APP_ENV` | Application environment mode | `development` |
| `DATABASE_URL` | SQLite or PostgreSQL connection string | `sqlite:///./weather.db` |
| `OPENMETEO_BASE_URL` | Open-Meteo base URL (free, no key required) | `https://api.open-meteo.com` |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API Key | `""` (Optional) |
| `OPENWEATHER_BASE_URL`| OpenWeather API endpoint | `https://api.openweathermap.org` |
| `IMD_API_KEY` | Official IMD API key | `""` (Standby for official key) |
| `IMD_BASE_URL` | Official IMD API base URL | `https://api.imd.gov.in` |
| `GEMINI_API_KEY` | Google Gemini API Key | `""` (Optional, fallback provided) |
| `GROQ_API_KEY` | Groq API Key | `""` (Optional) |
| `AI_PROVIDER` | AI Engine selector (`gemini`, `groq`, `none`) | `gemini` |
| `DUPLICATE_SIMILARITY_THRESHOLD` | Threshold for duplicate classification | `0.70` |
| `REQUEST_TIMEOUT` | External API request timeout (seconds) | `15` |
| `BACKGROUND_SYNC_INTERVAL_MINUTES` | Periodic ingestion frequency | `10` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:3000,http://127.0.0.1:3000` |

---

## 6. How to Obtain & Configure API Keys

1. **Open-Meteo**: Works immediately with zero configuration and no API key required for non-commercial evaluation.
2. **Google Gemini API**:
   - Obtain a free API key at: [https://aistudio.google.com/](https://aistudio.google.com/)
   - Add to `.env`: `GEMINI_API_KEY=AIzaSy...`
   - *Note*: If left empty, the backend automatically uses its built-in rule-based NLP classifier without crashing!
3. **OpenWeatherMap**:
   - Create a free account at [https://openweathermap.org/api](https://openweathermap.org/api)
   - Add to `.env`: `OPENWEATHER_API_KEY=your_key_here`
4. **IMD (India Meteorological Department)**:
   - When official credentials are provided by government departments, configure `IMD_API_KEY`. If unconfigured, the endpoint reports `source_unavailable` gracefully.

---

## 7. Running the Backend

### Seed Demo Data (Optional but Recommended)
Populates initial weather reports, active disaster warnings, and data source health:
```bash
python seed_data.py
```

### Start the Server
```bash
# Using python script:
python run.py

# Or directly with uvicorn:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 8. Interactive Documentation (Swagger UI)

FastAPI automatically serves interactive API documentation:
* **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 9. API Endpoint Reference

### Weather Data
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/weather/current?latitude=...&longitude=...` | Live conditions from Open-Meteo API |
| `GET` | `/api/weather/forecast?latitude=...&longitude=...&days=3` | Multi-day weather forecasts |

### Weather Reports
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/reports` | Query filtered reports (`state`, `city`, `event_type`, `verification_status`, etc.) |
| `POST` | `/api/reports` | Ingest citizen weather observation with AI evaluation & duplicate detection |
| `GET` | `/api/reports/map` | Lightweight coordinate records for the India intelligence map |
| `GET` | `/api/reports/{id}` | Detailed incident record and audit history |

### Live Disaster Alerts
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/alerts` | List active emergency weather bulletins |
| `POST` | `/api/alerts` | Broadcast a new emergency advisory bulletin |

### Analytics & KPIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/analytics/summary` | KPI cards summary (Total, Verified, Unverified, Alerts, etc.) |
| `GET` | `/api/analytics/events` | Categorical event distribution (Rainfall, Flood, Heatwave, etc.) |
| `GET` | `/api/analytics/states` | Report counts per Indian state |
| `GET` | `/api/analytics/timeline` | Influx timeline curve (hourly / daily) |
| `GET` | `/api/analytics/verification` | Verification status breakdown |

### System & Verification
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/sources/status` | Live health and latency metrics for all data sources |
| `POST` | `/api/verify/{report_id}` | Manually update verification status (Verified, Suspicious, Rejected) |
| `POST` | `/api/ingestion/run` | Manually trigger ingestion run across 10 Indian hubs |

---

## 10. Connecting with Next.js Frontend

The Next.js dashboard is pre-configured with a hybrid connector in `src/services/weatherService.ts`.
By default, it checks `http://localhost:8000/api`:
1. When the FastAPI backend is running, the frontend seamlessly renders live data from `weather.db` and external APIs.
2. If the backend is stopped or in development standby, it gracefully falls back to the rich local dataset so the frontend never crashes.
3. You can override the backend URL in the Next.js `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

---

## 11. Real vs Mock / Demo Data

To ensure academic transparency and hackathon compliance, data sources are explicitly tagged:

* **REAL API DATA**:
  * Real-time temperature, humidity, wind, and precipitation fetched directly from Open-Meteo's sensor model.
  * Real OpenWeather JSON packets when `OPENWEATHER_API_KEY` is configured.
  * Real citizen reports ingested via `POST /api/reports`.
* **MOCK / DEMO DATA**:
  * Synthetic citizen and social media reports generated by `seed_data.py` to illustrate historical flood and cyclone scenarios.
  * Verified vs Suspicious test examples for demonstration purposes.

---

## 12. Prototype Limitations

* **Database**: SQLite is used for lightweight local prototyping. For high-volume production deployments, configure PostgreSQL by updating `DATABASE_URL` (e.g. `postgresql://user:password@localhost/weather`).
* **AI Evaluation**: The AI classifier assesses semantic plausibility, location consistency, and linguistic urgency. It calculates a multi-signal credibility estimate rather than an absolute scientific ground truth.
* **Background Polling**: Managed via APScheduler in-process; production systems would typically use Celery/Redis for multi-worker scaling.
