package com.nwap.backend.service;

import com.nwap.backend.dto.AiAnalysisResultDto;
import com.nwap.backend.config.AppConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

/**
 * Open-Meteo service – Java equivalent of Python openmeteo_service.py.
 */
@Service
public class OpenMeteoService {

    private static final Logger logger = LoggerFactory.getLogger(OpenMeteoService.class);

    private final AppConfig appConfig;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public OpenMeteoService(AppConfig appConfig, WebClient webClient, ObjectMapper objectMapper) {
        this.appConfig = appConfig;
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Fetch current weather from Open-Meteo (no API key needed).
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getCurrentWeather(double latitude, double longitude) {
        String baseHost = appConfig.getOpenmeteoBaseUrl()
                .replace("https://", "").replace("http://", "").split("/")[0];

        try {
            String responseBody = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host(baseHost)
                            .path("/v1/forecast")
                            .queryParam("latitude", latitude)
                            .queryParam("longitude", longitude)
                            .queryParam("current_weather", "true")
                            .queryParam("hourly", "temperature_2m,relativehumidity_2m,precipitation,surface_pressure,cloudcover")
                            .queryParam("timezone", "Asia/Kolkata")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode data = objectMapper.readTree(responseBody);
            JsonNode current = data.path("current_weather");
            JsonNode hourly = data.path("hourly");

            Double temp = current.has("temperature") ? current.get("temperature").asDouble() : null;
            Double windSpeed = current.has("windspeed") ? current.get("windspeed").asDouble() : null;
            Double windDir = current.has("winddirection") ? current.get("winddirection").asDouble() : null;
            Integer weatherCode = current.has("weathercode") ? current.get("weathercode").asInt() : null;

            Double humidity = getFirstHourly(hourly, "relativehumidity_2m");
            Double precipitation = getFirstHourly(hourly, "precipitation");
            Double pressure = getFirstHourly(hourly, "surface_pressure");
            Double cloudCover = getFirstHourly(hourly, "cloudcover");

            return Map.of(
                    "status", "success",
                    "source", "Open-Meteo",
                    "latitude", latitude,
                    "longitude", longitude,
                    "temperature", temp != null ? temp : 0.0,
                    "apparent_temperature", temp != null ? temp : 0.0,
                    "humidity", humidity != null ? humidity : 0.0,
                    "precipitation", precipitation != null ? precipitation : 0.0,
                    "wind_speed", windSpeed != null ? windSpeed : 0.0,
                    "wind_direction", windDir != null ? windDir : 0.0,
                    "weather_code", weatherCode != null ? weatherCode : 0,
                    "cloud_cover", cloudCover != null ? cloudCover : 0.0,
                    "pressure", pressure != null ? pressure : 0.0,
                    "raw", objectMapper.convertValue(data, Map.class)
            );
        } catch (Exception e) {
            logger.error("Open-Meteo API error: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch Open-Meteo weather: " + e.getMessage(), e);
        }
    }

    /**
     * Fetch multi-day forecast from Open-Meteo.
     */
    public Map<String, Object> getForecast(double latitude, double longitude, int days) {
        String forecastHost = appConfig.getOpenmeteoBaseUrl()
                .replace("https://", "").replace("http://", "").split("/")[0];
        try {
            String responseBody = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host(forecastHost)
                            .path("/v1/forecast")
                            .queryParam("latitude", latitude)
                            .queryParam("longitude", longitude)
                            .queryParam("daily", "weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max")
                            .queryParam("timezone", "Asia/Kolkata")
                            .queryParam("forecast_days", days)
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return objectMapper.readValue(responseBody, Map.class);
        } catch (Exception e) {
            logger.error("Open-Meteo forecast error: {}", e.getMessage());
            throw new RuntimeException("Forecast service error: " + e.getMessage(), e);
        }
    }

    private Double getFirstHourly(JsonNode hourly, String field) {
        JsonNode arr = hourly.path(field);
        if (arr.isArray() && arr.size() > 0) return arr.get(0).asDouble();
        return null;
    }
}
