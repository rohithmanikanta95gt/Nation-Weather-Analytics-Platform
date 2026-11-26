import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    DATABASE_URL: str = "sqlite:///./weather.db"

    # Weather APIs
    OPENWEATHER_API_KEY: str = ""
    OPENWEATHER_BASE_URL: str = "https://api.openweathermap.org"
    OPENMETEO_BASE_URL: str = "https://api.open-meteo.com"

    # IMD
    IMD_API_KEY: str = ""
    IMD_BASE_URL: str = "https://api.imd.gov.in"

    # AI Configuration
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    AI_PROVIDER: str = "gemini"  # "gemini" | "groq" | "none"

    # Deduplication & Ingestion
    DUPLICATE_SIMILARITY_THRESHOLD: float = 0.70
    REQUEST_TIMEOUT: int = 15
    BACKGROUND_SYNC_INTERVAL_MINUTES: int = 10

    # Raw CORS string or list
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001"

    @property
    def cors_origins_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["http://localhost:3000"]
        return [item.strip() for item in self.CORS_ORIGINS.split(",") if item.strip()]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
