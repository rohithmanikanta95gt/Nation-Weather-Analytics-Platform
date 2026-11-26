package com.nwap.backend.service;

import com.nwap.backend.config.AppConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

/**
 * OpenWeather service – Java equivalent of Python openweather_service.py.
 */
@Service
public class OpenWeatherService {

    private static final Logger logger = LoggerFactory.getLogger(OpenWeatherService.class);

    private final AppConfig appConfig;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public OpenWeatherService(AppConfig appConfig, WebClient webClient, ObjectMapper objectMapper) {
        this.appConfig = appConfig;
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getCurrentWeather(double latitude, double longitude) {
        String apiKey = appConfig.getOpenweatherApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return Map.of(
                    "status", "not_configured",
                    "source", "OpenWeather",
                    "message", "OpenWeather API key not configured in environment. Configure OPENWEATHER_API_KEY to activate live feed."
            );
        }

        String baseUrl = appConfig.getOpenweatherBaseUrl().stripTrailing();
        String host = baseUrl.replace("https://", "").replace("http://", "").split("/")[0];

        try {
            String responseBody = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host(host)
                            .path("/data/2.5/weather")
                            .queryParam("lat", latitude)
                            .queryParam("lon", longitude)
                            .queryParam("appid", apiKey)
                            .queryParam("units", "metric")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            Map<String, Object> data = objectMapper.readValue(responseBody, Map.class);
            return Map.of("status", "success", "source", "OpenWeather", "data", data);

        } catch (WebClientResponseException.Unauthorized e) {
            return Map.of("status", "error", "source", "OpenWeather", "message", "Invalid OpenWeather API Key.");
        } catch (Exception e) {
            logger.warn("OpenWeather API error: {}", e.getMessage());
            return Map.of("status", "error", "source", "OpenWeather",
                    "message", "OpenWeather request error: " + e.getMessage());
        }
    }
}
