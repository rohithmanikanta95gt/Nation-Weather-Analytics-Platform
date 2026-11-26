from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple, Optional
from app.config import settings
from app.utils.helpers import haversine_distance_km, clean_text_tokens

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


def calculate_jaccard_similarity(text1: str, text2: str) -> float:
    """Compute token-level Jaccard similarity."""
    tokens1 = set(clean_text_tokens(text1))
    tokens2 = set(clean_text_tokens(text2))
    if not tokens1 or not tokens2:
        return 0.0
    intersection = len(tokens1.intersection(tokens2))
    union = len(tokens1.union(tokens2))
    return float(intersection) / float(union) if union > 0 else 0.0


def calculate_text_similarity(text1: str, text2: str) -> float:
    """Compute cosine TF-IDF similarity if sklearn is present, else Jaccard."""
    if not text1 or not text2:
        return 0.0
    if HAS_SKLEARN:
        try:
            vectorizer = TfidfVectorizer().fit([text1, text2])
            tfidf = vectorizer.transform([text1, text2])
            sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            return float(sim)
        except Exception:
            return calculate_jaccard_similarity(text1, text2)
    return calculate_jaccard_similarity(text1, text2)


def calculate_duplicate_probability(
    new_report: Dict[str, Any],
    recent_reports: List[Dict[str, Any]],
    threshold: Optional[float] = None,
) -> Tuple[float, Optional[int], bool]:
    """
    Compare new report against recent reports.
    Uses multi-signal matching:
    1. Geographic proximity (< 15km)
    2. Event type agreement
    3. Temporal closeness (< 12 hours)
    4. Text narrative similarity
    Returns (highest_prob, matched_id, is_duplicate)
    """
    if threshold is None:
        threshold = settings.DUPLICATE_SIMILARITY_THRESHOLD

    if not recent_reports:
        return (0.0, None, False)

    new_lat = float(new_report.get("latitude", 0.0))
    new_lng = float(new_report.get("longitude", 0.0))
    new_desc = str(new_report.get("description", ""))
    new_event = str(new_report.get("event_type", "")).lower()
    new_time = new_report.get("timestamp") or datetime.utcnow()

    highest_prob = 0.0
    matched_id = None

    for existing in recent_reports:
        ex_id = existing.get("id")
        ex_lat = float(existing.get("latitude", 0.0))
        ex_lng = float(existing.get("longitude", 0.0))
        ex_desc = str(existing.get("description", ""))
        ex_event = str(existing.get("event_type", "")).lower()
        ex_time = existing.get("timestamp") or datetime.utcnow()

        # 1. Geographic distance signal
        dist_km = haversine_distance_km(new_lat, new_lng, ex_lat, ex_lng)
        geo_score = max(0.0, 1.0 - (dist_km / 15.0)) if dist_km <= 15.0 else 0.0

        # If location is too far apart (> 20km), it cannot be a duplicate
        if dist_km > 20.0:
            continue

        # 2. Temporal closeness signal (decay over 12 hours)
        time_diff_hours = abs((new_time - ex_time).total_seconds()) / 3600.0
        time_score = max(0.0, 1.0 - (time_diff_hours / 12.0)) if time_diff_hours <= 12.0 else 0.0

        # 3. Event type match
        event_score = 1.0 if new_event == ex_event or new_event == "other" or ex_event == "other" else 0.4

        # 4. Narrative text similarity
        text_score = calculate_text_similarity(new_desc, ex_desc)

        # Weighted duplicate score:
        # 40% Text similarity, 30% Spatial proximity, 15% Temporal closeness, 15% Event match
        composite_score = (
            (text_score * 0.45)
            + (geo_score * 0.30)
            + (time_score * 0.15)
            + (event_score * 0.10)
        )

        if composite_score > highest_prob:
            highest_prob = round(composite_score, 3)
            matched_id = ex_id

    is_duplicate = highest_prob >= threshold
    return (highest_prob, matched_id if is_duplicate else None, is_duplicate)
