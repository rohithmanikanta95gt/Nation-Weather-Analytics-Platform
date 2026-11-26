import httpx
from typing import Dict, Any, Optional
from app.config import settings


async def get_imd_weather(station_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetch weather observation from India Meteorological Department (IMD) official endpoint.
    Per specification: Do not fake IMD responses when the API is unavailable.
    Return a clear 'source_unavailable' status.
    """
    if not settings.IMD_API_KEY or not settings.IMD_BASE_URL:
        return {
            "status": "source_unavailable",
            "source": "IMD",
            "message": "Official IMD API credentials not configured in .env (IMD_API_KEY / IMD_BASE_URL). Service is in standby for authorized Indian Meteorological API key integration.",
            "data": None,
        }

    headers = {
        "Authorization": f"Bearer {settings.IMD_API_KEY}",
        "Accept": "application/json",
    }
    url = f"{settings.IMD_BASE_URL.rstrip('/')}/v2/telemetry/station"
    params = {"station": station_id} if station_id else {}

    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            return {
                "status": "success",
                "source": "IMD",
                "data": response.json(),
            }
    except Exception as e:
        return {
            "status": "source_unavailable",
            "source": "IMD",
            "message": f"IMD endpoint communication error: {str(e)}",
            "data": None,
        }


async def get_imd_alerts() -> Dict[str, Any]:
    """
    Fetch active cyclone, flood, and severe convective warnings from IMD.
    """
    if not settings.IMD_API_KEY or not settings.IMD_BASE_URL:
        return {
            "status": "source_unavailable",
            "source": "IMD",
            "message": "IMD official warnings endpoint not configured in .env.",
            "alerts": [],
        }

    headers = {"Authorization": f"Bearer {settings.IMD_API_KEY}"}
    url = f"{settings.IMD_BASE_URL.rstrip('/')}/v2/warnings/national"

    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return {
                "status": "success",
                "source": "IMD",
                "alerts": response.json(),
            }
    except Exception as e:
        return {
            "status": "source_unavailable",
            "source": "IMD",
            "message": f"Unable to reach IMD warnings service: {str(e)}",
            "alerts": [],
        }
