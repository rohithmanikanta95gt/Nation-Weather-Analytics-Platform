import httpx
from typing import Dict, Any, Optional
from app.config import settings


async def get_openweather_current_weather(latitude: float, longitude: float) -> Dict[str, Any]:
    """
    Fetch current weather conditions from OpenWeatherMap API v2.5.
    Requires OPENWEATHER_API_KEY in environment.
    """
    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        return {
            "status": "not_configured",
            "source": "OpenWeather",
            "message": "OpenWeather API key not configured in .env. Configure OPENWEATHER_API_KEY to activate live feed.",
        }

    params = {
        "lat": latitude,
        "lon": longitude,
        "appid": api_key,
        "units": "metric",
    }

    url = f"{settings.OPENWEATHER_BASE_URL.rstrip('/')}/data/2.5/weather"

    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.get(url, params=params)
            if response.status_code == 401:
                return {
                    "status": "error",
                    "source": "OpenWeather",
                    "message": "Invalid OpenWeather API Key.",
                }
            response.raise_for_status()
            data = response.json()
            return {
                "status": "success",
                "source": "OpenWeather",
                "data": data,
            }
    except httpx.TimeoutException:
        return {
            "status": "error",
            "source": "OpenWeather",
            "message": "OpenWeather API request timed out.",
        }
    except Exception as e:
        return {
            "status": "error",
            "source": "OpenWeather",
            "message": f"OpenWeather request error: {str(e)}",
        }
