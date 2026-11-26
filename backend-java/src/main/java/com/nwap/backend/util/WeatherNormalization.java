package com.nwap.backend.util;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Normalization utilities – Java equivalent of Python normalization.py.
 * Handles WMO code mapping, event-type detection, severity estimation,
 * and Open-Meteo / OpenWeather JSON normalization.
 */
@Component
public class WeatherNormalization {

    // WMO weather interpretation code → event type
    private static final Map<Integer, String> WMO_EVENT_MAP = new HashMap<>();

    static {
        WMO_EVENT_MAP.put(0, "other");
        WMO_EVENT_MAP.put(1, "other");
        WMO_EVENT_MAP.put(2, "other");
        WMO_EVENT_MAP.put(3, "other");
        WMO_EVENT_MAP.put(45, "fog");
        WMO_EVENT_MAP.put(48, "fog");
        WMO_EVENT_MAP.put(51, "rainfall");
        WMO_EVENT_MAP.put(53, "rainfall");
        WMO_EVENT_MAP.put(55, "rainfall");
        WMO_EVENT_MAP.put(61, "rainfall");
        WMO_EVENT_MAP.put(63, "rainfall");
        WMO_EVENT_MAP.put(65, "rainfall");
        WMO_EVENT_MAP.put(80, "rainfall");
        WMO_EVENT_MAP.put(81, "rainfall");
        WMO_EVENT_MAP.put(82, "flood");
        WMO_EVENT_MAP.put(95, "thunderstorm");
        WMO_EVENT_MAP.put(96, "thunderstorm");
        WMO_EVENT_MAP.put(99, "thunderstorm");
    }

    /**
     * Keyword-based event type detection from raw text.
     */
    public static String detectEventTypeFromText(String text, String defaultType) {
        if (text == null || text.isBlank()) return defaultType != null ? defaultType : "other";
        String t = text.toLowerCase();

        if (containsAny(t, "flood", "waterlogging", "water submerged", "overflowing", "river bank", "inundation"))
            return "flood";
        if (containsAny(t, "cyclone", "deep depression", "storm surge"))
            return "cyclone";
        if (containsAny(t, "thunder", "lightning", "thunderstorm", "cloudburst"))
            return "thunderstorm";
        if (containsAny(t, "heatwave", "heat wave", "extreme heat", "loo", "scorching", "45 degree"))
            return "heatwave";
        if (containsAny(t, "dust storm", "sandstorm", "andhi", "dust"))
            return "dust_storm";
        if (containsAny(t, "fog", "dense fog", "mist", "smog", "zero visibility"))
            return "fog";
        if (containsAny(t, "strong wind", "gale", "gust", "squall", "high winds", "roof blown"))
            return "strong_wind";
        if (containsAny(t, "rain", "raining", "downpour", "heavy rain", "drizzle", "monsoon"))
            return "rainfall";

        return defaultType != null ? defaultType : "other";
    }

    public static String detectEventTypeFromText(String text) {
        return detectEventTypeFromText(text, "other");
    }

    /**
     * Severity estimation from quantitative + text signals.
     */
    public static String estimateSeverity(String eventType, Double rainfallMm, Double windKmh, Double tempC, String text) {
        String t = (text != null ? text : "").toLowerCase();

        if (containsAny(t, "disaster", "fatal", "devastating", "evacuate", "red alert", "emergency"))
            return "extreme";

        return switch (eventType != null ? eventType : "other") {
            case "flood" -> {
                if (rainfallMm != null && rainfallMm > 70) yield "severe";
                if (containsAny(t, "submerged", "cars floating", "knee deep", "chest deep")) yield "severe";
                yield "high";
            }
            case "heatwave" -> {
                if (tempC != null && tempC >= 44.0) yield "severe";
                if (tempC != null && tempC >= 41.0) yield "high";
                yield "moderate";
            }
            case "thunderstorm" -> {
                if (windKmh != null && windKmh > 65) yield "severe";
                if (windKmh != null && windKmh > 45) yield "high";
                yield "moderate";
            }
            case "strong_wind" -> {
                if (windKmh != null && windKmh > 60) yield "severe";
                if (windKmh != null && windKmh > 40) yield "high";
                yield "moderate";
            }
            case "rainfall" -> {
                if (rainfallMm != null && rainfallMm > 60) yield "high";
                if (rainfallMm != null && rainfallMm > 30) yield "moderate";
                yield "low";
            }
            default -> "moderate";
        };
    }

    public static String estimateSeverity(String eventType, String text) {
        return estimateSeverity(eventType, null, null, null, text);
    }

    /**
     * Normalize Open-Meteo API response JSON into a WeatherReport-compatible Map.
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> normalizeOpenMeteoData(Map<String, Object> rawJson,
                                                              String city, String state, String district) {
        Map<String, Object> curr = (Map<String, Object>) rawJson.getOrDefault("current_weather", Map.of());
        Map<String, Object> hourly = (Map<String, Object>) rawJson.getOrDefault("hourly", Map.of());

        double lat = toDouble(rawJson.get("latitude"), 0.0);
        double lng = toDouble(rawJson.get("longitude"), 0.0);
        int wmoCode = toInt(curr.get("weathercode"), 0);
        Double temp = toDoubleOrNull(curr.get("temperature"));
        Double windSpeed = toDoubleOrNull(curr.get("windspeed"));

        Double humidity = null;
        Double rainfall = null;

        List<?> humList = (List<?>) hourly.get("relativehumidity_2m");
        if (humList != null && !humList.isEmpty()) humidity = toDouble(humList.get(0), 0.0);

        List<?> precipList = (List<?>) hourly.get("precipitation");
        if (precipList != null && !precipList.isEmpty()) rainfall = toDouble(precipList.get(0), 0.0);

        String eventType = WMO_EVENT_MAP.getOrDefault(wmoCode, "other");
        if (temp != null && temp >= 42.0) eventType = "heatwave";
        else if (rainfall != null && rainfall > 50.0) eventType = "flood";

        String severity = estimateSeverity(eventType, rainfall, windSpeed, temp, null);
        StringBuilder desc = new StringBuilder("Observed " + eventType + " at " + city + ", " + state +
                ". Ambient Temp: " + temp + "°C, Wind: " + windSpeed + " km/h.");
        if (rainfall != null) desc.append(" Precipitation: ").append(rainfall).append(" mm.");

        Map<String, Object> result = new HashMap<>();
        result.put("source", "Open-Meteo");
        result.put("source_report_id", "om-" + city.toLowerCase() + "-" + System.currentTimeMillis() / 1000);
        result.put("timestamp", LocalDateTime.now());
        result.put("country", "India");
        result.put("state", state);
        result.put("city", city);
        result.put("district", district);
        result.put("latitude", lat);
        result.put("longitude", lng);
        result.put("event_type", eventType);
        result.put("description", desc.toString());
        result.put("temperature", temp);
        result.put("humidity", humidity);
        result.put("rainfall", rainfall);
        result.put("wind_speed", windSpeed);
        result.put("severity", severity);
        result.put("verification_status", "verified");
        result.put("verification_score", 0.95);
        result.put("verification_reason", "Direct calibrated sensor observation from Open-Meteo telemetry.");
        result.put("ai_confidence", 0.96);
        result.put("duplicate_probability", 0.0);
        result.put("is_duplicate", false);
        return result;
    }

    /**
     * Normalize OpenWeatherMap 2.5 API JSON into a WeatherReport-compatible Map.
     */
    @SuppressWarnings("unchecked")
    public static Map<String, Object> normalizeOpenWeatherData(Map<String, Object> rawJson,
                                                                String city, String state, String district) {
        Map<String, Object> main = (Map<String, Object>) rawJson.getOrDefault("main", Map.of());
        List<?> weatherArr = (List<?>) rawJson.getOrDefault("weather", List.of(Map.of()));
        Map<String, Object> weatherInfo = weatherArr.isEmpty() ? Map.of() : (Map<String, Object>) weatherArr.get(0);
        Map<String, Object> wind = (Map<String, Object>) rawJson.getOrDefault("wind", Map.of());
        Map<String, Object> coord = (Map<String, Object>) rawJson.getOrDefault("coord", Map.of());
        Object rainObj = rawJson.get("rain");
        Map<String, Object> rain = (rainObj instanceof Map) ? (Map<String, Object>) rainObj : Map.of();

        Double temp = toDoubleOrNull(main.get("temp"));
        Double humidity = toDoubleOrNull(main.get("humidity"));
        double windSpeedMs = toDouble(wind.get("speed"), 0.0);
        Double windSpeedKmh = windSpeedMs > 0 ? windSpeedMs * 3.6 : null;
        double rainfall1h = toDouble(rain.get("1h"), 0.0);

        String condMain = String.valueOf(weatherInfo.getOrDefault("main", "")).toLowerCase();
        String condDesc = String.valueOf(weatherInfo.getOrDefault("description", ""));

        String eventType = "other";
        if (condMain.contains("rain") || condMain.contains("drizzle")) eventType = "rainfall";
        else if (condMain.contains("thunderstorm")) eventType = "thunderstorm";
        else if (condMain.contains("fog") || condMain.contains("mist") || condMain.contains("haze")) eventType = "fog";
        else if (condMain.contains("dust") || condMain.contains("sand")) eventType = "dust_storm";

        if (temp != null && temp >= 42.0) eventType = "heatwave";
        else if (rainfall1h > 50.0) eventType = "flood";

        String severity = estimateSeverity(eventType, rainfall1h, windSpeedKmh, temp, null);
        String desc = "OpenWeather reported " + condDesc + " in " + city + ", " + state +
                ". Temp: " + temp + "°C, Humidity: " + humidity + "%.";

        Map<String, Object> result = new HashMap<>();
        result.put("source", "OpenWeather");
        result.put("source_report_id", String.valueOf(rawJson.getOrDefault("id", "owm-" + city.toLowerCase())));
        result.put("timestamp", LocalDateTime.now());
        result.put("country", "India");
        result.put("state", state);
        result.put("city", city);
        result.put("district", district);
        result.put("latitude", toDouble(coord.get("lat"), 0.0));
        result.put("longitude", toDouble(coord.get("lon"), 0.0));
        result.put("event_type", eventType);
        result.put("description", desc);
        result.put("temperature", temp);
        result.put("humidity", humidity);
        result.put("rainfall", rainfall1h);
        result.put("wind_speed", windSpeedKmh);
        result.put("severity", severity);
        result.put("verification_status", "verified");
        result.put("verification_score", 0.92);
        result.put("verification_reason", "Verified via OpenWeather API feed.");
        result.put("ai_confidence", 0.94);
        result.put("duplicate_probability", 0.0);
        result.put("is_duplicate", false);
        return result;
    }

    // ---- private helpers ----

    private static boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    public static double toDouble(Object val, double defaultVal) {
        if (val == null) return defaultVal;
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return defaultVal; }
    }

    public static Double toDoubleOrNull(Object val) {
        if (val == null) return null;
        try { return Double.parseDouble(val.toString()); } catch (Exception e) { return null; }
    }

    private static int toInt(Object val, int defaultVal) {
        if (val == null) return defaultVal;
        try { return (int) Double.parseDouble(val.toString()); } catch (Exception e) { return defaultVal; }
    }
}
