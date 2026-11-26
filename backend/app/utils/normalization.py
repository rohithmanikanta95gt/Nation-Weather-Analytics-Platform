from typing import Dict, Any, Optional
from datetime import datetime


# Mapping WMO weather interpretation codes to standardized event types
WMO_EVENT_MAP: Dict[int, str] = {
    0: "other",         # Clear sky
    1: "other",         # Mainly clear
    2: "other",         # Partly cloudy
    3: "other",         # Overcast
    45: "fog",          # Fog
    48: "fog",          # Depositing rime fog
    51: "rainfall",     # Light drizzle
    53: "rainfall",     # Moderate drizzle
    55: "rainfall",     # Dense drizzle
    61: "rainfall",     # Slight rain
    63: "rainfall",     # Moderate rain
    65: "rainfall",     # Heavy rain
    80: "rainfall",     # Slight rain showers
    81: "rainfall",     # Moderate rain showers
    82: "flood",        # Violent rain showers / Flood risk
    95: "thunderstorm", # Thunderstorm: slight or moderate
    96: "thunderstorm", # Thunderstorm with slight hail
    99: "thunderstorm", # Thunderstorm with heavy hail
}


def detect_event_type_from_text(text: str, default: str = "other") -> str:
    """
    Keyword based classification of raw user narrative.
    """
    if not text:
        return default
    t = text.lower()

    if any(k in t for k in ["flood", "waterlogging", "water submerged", "overflowing", "river bank", "inundation"]):
        return "flood"
    if any(k in t for k in ["cyclone", "deep depression", "storm surge"]):
        return "cyclone"
    if any(k in t for k in ["thunder", "lightning", "thunderstorm", "cloudburst"]):
        return "thunderstorm"
    if any(k in t for k in ["heatwave", "heat wave", "extreme heat", "loo", "scorching", "45 degree"]):
        return "heatwave"
    if any(k in t for k in ["dust storm", "sandstorm", "andhi", "dust"]):
        return "dust_storm"
    if any(k in t for k in ["fog", "dense fog", "mist", "smog", "zero visibility"]):
        return "fog"
    if any(k in t for k in ["strong wind", "gale", "gust", "squall", "high winds", "roof blown"]):
        return "strong_wind"
    if any(k in t for k in ["rain", "raining", "downpour", "heavy rain", "drizzle", "monsoon"]):
        return "rainfall"

    return default


def estimate_severity(
    event_type: str,
    rainfall_mm: Optional[float] = None,
    wind_kmh: Optional[float] = None,
    temp_c: Optional[float] = None,
    text: Optional[str] = None
) -> str:
    """
    Derive severity category from quantitative thresholds and text cues.
    """
    t = (text or "").lower()

    # Extreme indicators
    if any(k in t for k in ["disaster", "fatal", "devastating", "evacuate", "red alert", "emergency"]):
        return "extreme"

    if event_type == "flood":
        if rainfall_mm and rainfall_mm > 70:
            return "severe"
        if any(k in t for k in ["submerged", "cars floating", "knee deep", "chest deep"]):
            return "severe"
        return "high"

    if event_type == "heatwave":
        if temp_c and temp_c >= 44.0:
            return "severe"
        if temp_c and temp_c >= 41.0:
            return "high"
        return "moderate"

    if event_type == "thunderstorm":
        if wind_kmh and wind_kmh > 65:
            return "severe"
        if wind_kmh and wind_kmh > 45:
            return "high"
        return "moderate"

    if event_type == "strong_wind":
        if wind_kmh and wind_kmh > 60:
            return "severe"
        if wind_kmh and wind_kmh > 40:
            return "high"
        return "moderate"

    if event_type == "rainfall":
        if rainfall_mm and rainfall_mm > 60:
            return "high"
        if rainfall_mm and rainfall_mm > 30:
            return "moderate"
        return "low"

    return "moderate"


def normalize_openmeteo_data(
    raw_json: Dict[str, Any],
    city: str,
    state: str,
    district: Optional[str] = None
) -> Dict[str, Any]:
    """
    Normalize Open-Meteo current_weather and hourly response into WeatherReport dictionary.
    """
    curr = raw_json.get("current_weather", {})
    hourly = raw_json.get("hourly", {})

    lat = raw_json.get("latitude", 0.0)
    lng = raw_json.get("longitude", 0.0)
    wmo_code = int(curr.get("weathercode", 0))

    temp = curr.get("temperature")
    wind_speed = curr.get("windspeed")
    
    # Try getting humidity and precipitation from hourly or current
    humidity = None
    rainfall = None
    if "relativehumidity_2m" in hourly and hourly["relativehumidity_2m"]:
        humidity = float(hourly["relativehumidity_2m"][0])
    if "precipitation" in hourly and hourly["precipitation"]:
        rainfall = float(hourly["precipitation"][0])

    event_type = WMO_EVENT_MAP.get(wmo_code, "other")
    if temp and temp >= 42.0:
        event_type = "heatwave"
    elif rainfall and rainfall > 50.0:
        event_type = "flood"

    severity = estimate_severity(event_type, rainfall_mm=rainfall, wind_kmh=wind_speed, temp_c=temp)

    desc = f"Observed {event_type} at {city}, {state}. Ambient Temp: {temp}°C, Wind: {wind_speed} km/h."
    if rainfall is not None:
        desc += f" Precipitation: {rainfall} mm."

    return {
        "source": "Open-Meteo",
        "source_report_id": f"om-{city.lower()}-{int(datetime.utcnow().timestamp())}",
        "timestamp": datetime.utcnow(),
        "country": "India",
        "state": state,
        "city": city,
        "district": district,
        "latitude": lat,
        "longitude": lng,
        "event_type": event_type,
        "description": desc,
        "temperature": temp,
        "humidity": humidity,
        "rainfall": rainfall,
        "wind_speed": wind_speed,
        "severity": severity,
        "verification_status": "verified",
        "verification_score": 0.95,
        "verification_reason": "Direct calibrated sensor observation from Open-Meteo telemetry.",
        "ai_confidence": 0.96,
        "duplicate_probability": 0.0,
        "is_duplicate": False,
    }


def normalize_openweather_data(
    raw_json: Dict[str, Any],
    city: str,
    state: str,
    district: Optional[str] = None
) -> Dict[str, Any]:
    """
    Normalize OpenWeatherMap 2.5 current weather JSON into common WeatherReport schema.
    """
    main = raw_json.get("main", {})
    weather_arr = raw_json.get("weather", [{}])
    weather_info = weather_arr[0] if weather_arr else {}
    wind = raw_json.get("wind", {})
    coord = raw_json.get("coord", {})
    rain = raw_json.get("rain", {})

    temp = main.get("temp")
    humidity = main.get("humidity")
    wind_speed_ms = wind.get("speed", 0.0)
    wind_speed_kmh = wind_speed_ms * 3.6 if wind_speed_ms else None
    rainfall_1h = rain.get("1h", 0.0) if isinstance(rain, dict) else 0.0

    condition_main = weather_info.get("main", "").lower()
    condition_desc = weather_info.get("description", "")

    event_type = "other"
    if "rain" in condition_main or "drizzle" in condition_main:
        event_type = "rainfall"
    elif "thunderstorm" in condition_main:
        event_type = "thunderstorm"
    elif "fog" in condition_main or "mist" in condition_main or "haze" in condition_main:
        event_type = "fog"
    elif "dust" in condition_main or "sand" in condition_main:
        event_type = "dust_storm"

    if temp and temp >= 42.0:
        event_type = "heatwave"
    elif rainfall_1h and rainfall_1h > 50.0:
        event_type = "flood"

    severity = estimate_severity(event_type, rainfall_mm=rainfall_1h, wind_kmh=wind_speed_kmh, temp_c=temp)

    desc = f"OpenWeather reported {condition_desc} in {city}, {state}. Temp: {temp}°C, Humidity: {humidity}%."

    return {
        "source": "OpenWeather",
        "source_report_id": str(raw_json.get("id", f"owm-{city.lower()}")),
        "timestamp": datetime.utcnow(),
        "country": "India",
        "state": state,
        "city": city,
        "district": district,
        "latitude": coord.get("lat", 0.0),
        "longitude": coord.get("lon", 0.0),
        "event_type": event_type,
        "description": desc,
        "temperature": temp,
        "humidity": float(humidity) if humidity is not None else None,
        "rainfall": float(rainfall_1h) if rainfall_1h is not None else None,
        "wind_speed": wind_speed_kmh,
        "severity": severity,
        "verification_status": "verified",
        "verification_score": 0.92,
        "verification_reason": "Verified via OpenWeather API feed.",
        "ai_confidence": 0.94,
        "duplicate_probability": 0.0,
        "is_duplicate": False,
    }
