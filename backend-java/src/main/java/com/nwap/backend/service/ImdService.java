package com.nwap.backend.service;

import com.nwap.backend.config.AppConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * IMD service – Java equivalent of Python imd_service.py.
 * Returns source_unavailable when official credentials are not set.
 * Never returns fake/mock IMD data.
 */
@Service
public class ImdService {

    private static final Logger logger = LoggerFactory.getLogger(ImdService.class);

    private final AppConfig appConfig;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public ImdService(AppConfig appConfig, WebClient webClient, ObjectMapper objectMapper) {
        this.appConfig = appConfig;
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> getImdWeather(String stationId) {
        String apiKey = appConfig.getImdApiKey();
        String baseUrl = appConfig.getImdBaseUrl();

        if (apiKey == null || apiKey.isBlank()) {
            return Map.of(
                    "status", "source_unavailable",
                    "source", "IMD",
                    "message", "Official IMD API credentials not configured in environment (IMD_API_KEY / IMD_BASE_URL). Service is in standby for authorized Indian Meteorological API key integration.",
                    "data", (Object) null
            );
        }

        String host = baseUrl.replace("https://", "").replace("http://", "").split("/")[0];
        try {
            WebClient.RequestHeadersUriSpec<?> req = webClient.get();
            String responseBody = req
                    .uri(uriBuilder -> {
                        var b = uriBuilder.scheme("https").host(host).path("/v2/telemetry/station");
                        if (stationId != null && !stationId.isBlank()) b = b.queryParam("station", stationId);
                        return b.build();
                    })
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .header(HttpHeaders.ACCEPT, "application/json")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return Map.of("status", "success", "source", "IMD",
                    "data", objectMapper.readValue(responseBody, Map.class));
        } catch (Exception e) {
            logger.warn("IMD weather error: {}", e.getMessage());
            return Map.of("status", "source_unavailable", "source", "IMD",
                    "message", "IMD endpoint communication error: " + e.getMessage(), "data", (Object) null);
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getImdAlerts() {
        String apiKey = appConfig.getImdApiKey();
        String baseUrl = appConfig.getImdBaseUrl();

        if (apiKey == null || apiKey.isBlank()) {
            return Map.of("status", "source_unavailable", "source", "IMD",
                    "message", "IMD official warnings endpoint not configured in environment.",
                    "alerts", List.of());
        }

        String host = baseUrl.replace("https://", "").replace("http://", "").split("/")[0];
        try {
            String responseBody = webClient.get()
                    .uri(uriBuilder -> uriBuilder.scheme("https").host(host).path("/v2/warnings/national").build())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return Map.of("status", "success", "source", "IMD",
                    "alerts", objectMapper.readValue(responseBody, List.class));
        } catch (Exception e) {
            logger.warn("IMD alerts error: {}", e.getMessage());
            return Map.of("status", "source_unavailable", "source", "IMD",
                    "message", "Unable to reach IMD warnings service: " + e.getMessage(), "alerts", List.of());
        }
    }
}
