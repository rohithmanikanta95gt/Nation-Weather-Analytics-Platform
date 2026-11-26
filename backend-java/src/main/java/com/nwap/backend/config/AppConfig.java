package com.nwap.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfig {

    private String env = "development";
    private String databaseUrl = "jdbc:sqlite:./weather.db";

    // Weather API
    private String openweatherApiKey = "";
    private String openweatherBaseUrl = "https://api.openweathermap.org";
    private String openmeteoBaseUrl = "https://api.open-meteo.com";

    // IMD
    private String imdApiKey = "";
    private String imdBaseUrl = "https://api.imd.gov.in";

    // AI
    private String geminiApiKey = "";
    private String groqApiKey = "";
    private String aiProvider = "gemini";

    // Deduplication & Ingestion
    private double duplicateSimilarityThreshold = 0.70;
    private int requestTimeoutSeconds = 15;
    private int backgroundSyncIntervalMinutes = 10;

    // CORS
    private String corsOrigins = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001";

    public List<String> getCorsOriginsList() {
        if (corsOrigins == null || corsOrigins.isBlank()) {
            return List.of("http://localhost:3000");
        }
        return Arrays.stream(corsOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();
    }
}
