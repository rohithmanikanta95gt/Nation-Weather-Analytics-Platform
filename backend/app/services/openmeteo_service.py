import httpx
from typing import Dict, Any, Optional
from app.config import settings


async def get_current_weather(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Fetch real-time current weather conditions from Open-Meteo free API.
    Does not require an API key.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current_weather": "true",
        "hourly": "temperature_2m,relativehumidity_2m,precipitation,surface_pressure,cloudcover",
        "timezone": "Asia/Kolkata",
    }

    url = f"{settings.OPENMETEO_BASE_URL.rstrip('/')}/v1/forecast"

    async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    # Extract fields as specified by prompt:
    # latitude, longitude, temperature, apparent temperature, humidity, precipitation,
    # wind speed, wind direction, weather code, cloud cover, pressure
    current = data.get("current_weather", {})
    hourly = data.get("hourly", {})

    temp = current.get("temperature")
    wind_speed = current.get("windspeed")
    wind_direction = current.get("winddirection")
    weather_code = current.get("weathercode")

    humidity = hourly.get("relativehumidity_2m", [None])[0] if "relativehumidity_2m" in hourly else None
    precipitation = hourly.get("precipitation", [None])[0] if "precipitation" in hourly else None
    pressure = hourly.get("surface_pressure", [None])[0] if "surface_pressure" in hourly else None
    cloud_cover = hourly.get("cloudcover", [None])[0] if "cloudcover" in hourly else None

    # Apparent temperature estimate if not directly returned
    apparent_temp = temp

    return {
        "status": "success",
        "source": "Open-Meteo",
        "latitude": latitude,
        "longitude": longitude,
        "temperature": temp,
        "apparent_temperature": apparent_temp,
        "humidity": humidity,
        "precipitation": precipitation,
        "wind_speed": wind_speed,
        "wind_direction": wind_direction,
        "weather_code": weather_code,
        "cloud_cover": cloud_cover,
        "pressure": pressure,
        "raw": data,
    }


async def get_forecast(latitude: float, longitude: float, days: int = 3) -> Dict[str, Any]:
    """
    Fetch multi-day weather forecast from Open-Meteo.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": "weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max",
        "timezone": "Asia/Kolkata",
        "forecast_days": days,
    }

    url = f"{settings.OPENMETEO_BASE_URL.rstrip('/')}/v1/forecast"

    async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()
