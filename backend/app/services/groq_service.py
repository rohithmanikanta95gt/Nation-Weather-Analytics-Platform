import json
import httpx
from typing import Dict, Any
from app.config import settings
from app.database.schemas import AIAnalysisResult
from app.services.gemini_service import rule_based_fallback_analysis, SYSTEM_PROMPT


async def analyze_weather_report_groq(report: Dict[str, Any]) -> AIAnalysisResult:
    """
    Classify and evaluate report credibility using Groq API (llama3-70b-8192 or similar).
    """
    api_key = settings.GROQ_API_KEY
    if not api_key:
        return rule_based_fallback_analysis(report)

    desc = report.get("description", "")
    city = report.get("city", "")
    state = report.get("state", "")
    lat = report.get("latitude")
    lng = report.get("longitude")

    user_content = f"""
Analyze this report and respond ONLY in valid JSON matching the instructions:
- Description: "{desc}"
- City: {city}, State: {state}
- Lat: {lat}, Lng: {lng}
"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2,
    }

    try:
        async with httpx.AsyncClient(timeout=settings.REQUEST_TIMEOUT) as client:
            response = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return AIAnalysisResult(
                event_type=str(parsed.get("event_type", "other")).lower(),
                severity=str(parsed.get("severity", "moderate")).lower(),
                location_detected=str(parsed.get("location_detected", f"{city}, {state}")),
                credibility=str(parsed.get("credibility", "unverified")).lower(),
                confidence=float(parsed.get("confidence", 0.80)),
                reason=str(parsed.get("reason", "Analyzed by Groq LLM.")),
            )
    except Exception:
        pass

    return rule_based_fallback_analysis(report)
