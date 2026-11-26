# NWAP India – Java Spring Boot Backend

**National Weather Big Data Analytics Platform** – Spring Boot replacement for the original Python FastAPI backend.  
The Next.js frontend continues to work without any modifications.

---

## Architecture

```
backend-java/
├── pom.xml                                        Maven build (Java 21, Spring Boot 3.3)
└── src/main/java/com/nwap/backend/
    ├── NwapBackendApplication.java               Entry point + @EnableScheduling
    ├── config/
    │   ├── AppConfig.java                        Environment variables / settings
    │   ├── CorsConfig.java                       CORS filter (matches CORS_ORIGINS env var)
    │   ├── WebClientConfig.java                  Reactive WebClient with timeout
    │   └── JacksonConfig.java                    Jackson ISO-8601 date serialization
    ├── entity/
    │   ├── WeatherReport.java                    JPA entity → weather_reports table
    │   ├── WeatherAlert.java                     JPA entity → weather_alerts table
    │   └── DataSourceStatus.java                 JPA entity → data_source_status table
    ├── repository/
    │   ├── WeatherReportRepository.java          JPA + JpaSpecificationExecutor
    │   ├── WeatherAlertRepository.java
    │   └── DataSourceStatusRepository.java
    ├── dto/                                      Request/Response DTOs (JSON field names preserved)
    ├── service/
    │   ├── GeminiService.java                    Gemini 1.5 Flash AI + rule-based fallback
    │   ├── GroqService.java                      Groq LLM (llama-3.3-70b-versatile)
    │   ├── DuplicateService.java                 TF-IDF cosine + Haversine deduplication
    │   ├── IngestionService.java                 Citizen report pipeline + background ingestion
    │   ├── OpenMeteoService.java                 Open-Meteo API (no key)
    │   ├── OpenWeatherService.java               OpenWeatherMap 2.5 API
    │   ├── ImdService.java                       IMD API (standby if key not set)
    │   ├── WeatherDataService.java               Analytics, reports, verification queries
    │   ├── AlertService.java                     Alert CRUD + source status management
    │   └── WeatherIngestionScheduler.java        Spring @Scheduled background job
    ├── controller/
    │   ├── RootController.java                   GET /
    │   ├── WeatherController.java                GET /api/weather/current, /api/weather/forecast
    │   ├── ReportsController.java                GET/POST /api/reports, /api/reports/map, /api/reports/{id}
    │   ├── AlertsController.java                 GET/POST /api/alerts
    │   ├── AnalyticsController.java              GET /api/analytics/*
    │   ├── VerificationController.java           POST /api/verify/{id}, GET /api/sources/status, POST /api/ingestion/run
    │   └── GlobalExceptionHandler.java           Unified error responses matching FastAPI format
    └── util/
        ├── WeatherHelpers.java                   Haversine, text tokenization, city metadata
        ├── WeatherNormalization.java              WMO codes, event detection, severity, normalization
        └── DtoMapper.java                        Entity → DTO conversion
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Java JDK | 21 or 25 |
| Apache Maven | 3.9+ |
| (Optional) Docker | For containerized deployment |

> **Note:** Maven is not bundled. Install it from [maven.apache.org](https://maven.apache.org/download.cgi) or via `winget install Apache.Maven` on Windows.

---

## Setup & Run

### 1. Configure environment variables

```bash
# Copy the example file
copy .env.example .env
# Edit .env and fill in your API keys
notepad .env
```

### 2. Set environment variables before starting (Windows PowerShell)

```powershell
# Load .env file into the current shell session
Get-Content .\.env | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '=' } | ForEach-Object {
    $key, $val = $_ -split '=', 2
    [System.Environment]::SetEnvironmentVariable($key.Trim(), $val.Trim(), 'Process')
}
```

### 3. Build & Run

```powershell
# From the backend-java directory
mvn clean package -DskipTests

# Run the JAR
java -jar target/nwap-backend-1.0.0.jar

# Or run directly with Maven
mvn spring-boot:run
```

### 4. Verify

```powershell
# Health check
curl http://localhost:8000/

# Swagger UI
Start-Process "http://localhost:8000/docs"
```

---

## API Endpoints

All endpoints are identical to the original Python FastAPI backend.  
The Next.js frontend's `NEXT_PUBLIC_API_URL` should point to `http://localhost:8000/api`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health & metadata |
| GET | `/api/weather/current` | Real-time weather (Open-Meteo) |
| GET | `/api/weather/forecast` | Multi-day forecast |
| GET | `/api/reports` | Paginated, filtered reports |
| POST | `/api/reports` | Submit citizen report (full AI pipeline) |
| GET | `/api/reports/map` | Lightweight geo markers |
| GET | `/api/reports/{id}` | Single report detail |
| GET | `/api/alerts` | Active weather alerts |
| POST | `/api/alerts` | Broadcast emergency alert |
| GET | `/api/analytics/summary` | Dashboard KPIs |
| GET | `/api/analytics/events` | Event type distribution |
| GET | `/api/analytics/states` | State-wise analytics |
| GET | `/api/analytics/timeline` | Time-series trend |
| GET | `/api/analytics/verification` | Verification breakdown |
| POST | `/api/verify/{id}` | Manual moderation |
| GET | `/api/sources/status` | Data source health |
| POST | `/api/ingestion/run` | Manual ingestion trigger |

---

## Key Differences from Python Backend

| Feature | Python (FastAPI) | Java (Spring Boot) |
|---------|-------------------|---------------------|
| Runtime | uvicorn async ASGI | Embedded Tomcat |
| HTTP client | httpx async | Spring WebClient (Reactor) |
| ORM | SQLAlchemy | Spring Data JPA / Hibernate |
| Scheduler | APScheduler | Spring `@Scheduled` |
| TF-IDF | scikit-learn | Pure-Java TF-IDF cosine |
| Config | pydantic-settings | `@ConfigurationProperties` |
| Docs | FastAPI auto-docs | Springdoc OpenAPI (Swagger UI) |
| Port | 8000 | **8000** (same) |

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | `development` | Application environment |
| `DATABASE_URL` | `jdbc:sqlite:./weather.db` | SQLite connection string |
| `OPENWEATHER_API_KEY` | _(empty)_ | OpenWeatherMap API key |
| `OPENMETEO_BASE_URL` | `https://api.open-meteo.com` | Open-Meteo base URL |
| `IMD_API_KEY` | _(empty)_ | IMD official API key |
| `GEMINI_API_KEY` | _(empty)_ | Google Gemini API key |
| `GROQ_API_KEY` | _(empty)_ | Groq API key |
| `AI_PROVIDER` | `gemini` | `gemini` \| `groq` \| `none` |
| `DUPLICATE_SIMILARITY_THRESHOLD` | `0.70` | Dedup threshold (0–1) |
| `REQUEST_TIMEOUT` | `15` | External API timeout (seconds) |
| `BACKGROUND_SYNC_INTERVAL_MINUTES` | `10` | Background ingestion interval |
| `CORS_ORIGINS` | `http://localhost:3000,...` | Comma-separated CORS origins |
