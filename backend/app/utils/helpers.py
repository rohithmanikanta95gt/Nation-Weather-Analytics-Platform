import math
import re
from typing import Dict, Any, Optional

# Reference coordinates for major Indian cities
INDIAN_CITIES_COORDINATES: Dict[str, Dict[str, Any]] = {
    "chennai": {"state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    "mumbai": {"state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    "delhi": {"state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    "new delhi": {"state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    "kolkata": {"state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    "bengaluru": {"state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    "bangalore": {"state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    "hyderabad": {"state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    "guwahati": {"state": "Assam", "lat": 26.1445, "lng": 91.7362},
    "ahmedabad": {"state": "Gujarat", "lat": 23.0225, "lng": 72.5714},
    "jaipur": {"state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    "kochi": {"state": "Kerala", "lat": 9.9312, "lng": 76.2673},
    "cochin": {"state": "Kerala", "lat": 9.9312, "lng": 76.2673},
    "srinagar": {"state": "Jammu & Kashmir", "lat": 34.0837, "lng": 74.7973},
    "bhubaneswar": {"state": "Odisha", "lat": 20.2961, "lng": 85.8245},
    "pune": {"state": "Maharashtra", "lat": 18.5204, "lng": 73.8567},
    "surat": {"state": "Gujarat", "lat": 21.1702, "lng": 72.8311},
    "patna": {"state": "Bihar", "lat": 25.5941, "lng": 85.1376},
    "lucknow": {"state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462},
    "visakhapatnam": {"state": "Andhra Pradesh", "lat": 17.6868, "lng": 83.2185},
}


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points
    on the earth (specified in decimal degrees).
    """
    r = 6371.0  # Earth's radius in kilometers

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return r * c


def clean_text_tokens(text: str) -> list[str]:
    """
    Lowercase, remove punctuation, and tokenize text into words.
    """
    if not text:
        return []
    clean = re.sub(r"[^\w\s]", " ", text.lower())
    return [word for word in clean.split() if len(word) > 2]


def find_city_metadata(city_name: str) -> Optional[Dict[str, Any]]:
    """Lookup state and coordinate metadata for Indian city."""
    if not city_name:
        return None
    key = city_name.strip().lower()
    return INDIAN_CITIES_COORDINATES.get(key)
