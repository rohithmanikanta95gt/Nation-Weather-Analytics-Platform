package com.nwap.backend.service;

import com.nwap.backend.dto.AiAnalysisResultDto;
import com.nwap.backend.config.AppConfig;
import com.nwap.backend.util.WeatherNormalization;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Gemini AI service – Java equivalent of Python gemini_service.py.
 * Sends weather reports to Gemini 1.5 Flash for structured JSON analysis.
 * Falls back to rule-based analysis if key is not set or API fails.
 */
@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    private static final String SYSTEM_PROMPT = """
            You are an AI Meteorological & Disaster Intelligence Analyst for India's National Weather Platform.
            Analyze the following user/citizen weather report for:
            1. weather event category (rainfall, thunderstorm, flood, heatwave, fog, dust_storm, strong_wind, cyclone, or other)
            2. severity level (low, moderate, high, severe, extreme)
            3. detected location and geographic consistency
            4. credibility indicators (presence of specific ground observations, plausible physical phenomena, absence of sensationalist clickbait/spam)
            5. confidence score (0.0 to 1.0)
            6. recommended credibility status (verified, unverified, suspicious, or rejected)
            
            Output strictly valid JSON matching this schema:
            {
              "event_type": "string",
              "severity": "string",
              "location_detected": "string",
              "credibility": "string",
              "confidence": 0.85,
              "reason": "string"
            }
            """;

    private final AppConfig appConfig;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public GeminiService(AppConfig appConfig, WebClient webClient, ObjectMapper objectMapper) {
        this.appConfig = appConfig;
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Rule-based fallback analysis (no AI key required).
     * Mirrors Python rule_based_fallback_analysis().
     */
    public AiAnalysisResultDto ruleBasedFallback(Map<String, Object> report) {
        String desc = String.valueOf(report.getOrDefault("description", ""));
        String city = String.valueOf(report.getOrDefault("city", "Unknown"));
        String state = String.valueOf(report.getOrDefault("state", "India"));
        String t = desc.toLowerCase();

        String eventType = WeatherNormalization.detectEventTypeFromText(desc,
                (String) report.get("event_type"));
        String severity = WeatherNormalization.estimateSeverity(eventType, t);

        // Suspicious / spam detection
        boolean hasSuspiciousFlags = t.contains("tsunami in river") || t.contains("alien")
                || t.contains("ufo") || t.contains("conspiracy")
                || t.contains("click here") || t.contains("free bitcoin");
        boolean tooShort = desc.strip().length() < 10;

        if (hasSuspiciousFlags) {
            return AiAnalysisResultDto.builder()
                    .eventType(eventType).severity(severity)
                    .locationDetected(city + ", " + state)
                    .credibility("rejected").confidence(0.45)
                    .reason("Contains improbable or malicious disinformation keywords")
                    .build();
        }
        if (tooShort) {
            return AiAnalysisResultDto.builder()
                    .eventType(eventType).severity(severity)
                    .locationDetected(city + ", " + state)
                    .credibility("suspicious").confidence(0.45)
                    .reason("Description is too brief to substantiate ground observations")
                    .build();
        }

        boolean hasSpecifics = t.contains("road") || t.contains("street") || t.contains("flyover")
                || t.contains("water level") || t.contains("feet") || t.contains("inches")
                || t.contains(" cm") || t.contains(" mm") || t.contains("gate")
                || t.contains("station") || t.contains("bridge");

        return AiAnalysisResultDto.builder()
                .eventType(eventType).severity(severity)
                .locationDetected(city + ", " + state)
                .credibility(hasSpecifics ? "verified" : "unverified")
                .confidence(hasSpecifics ? 0.88 : 0.72)
                .reason(hasSpecifics
                        ? "Report provides plausible ground meteorological details consistent with regional weather context."
                        : "Report describes plausible conditions but lacks precise street/instrument measurements.")
                .build();
    }

    /**
     * Analyze a weather report using Gemini 1.5 Flash.
     * Returns a Mono so it can be subscribed to reactively or block()-ed.
     */
    public AiAnalysisResultDto analyzeReport(Map<String, Object> report) {
        String apiKey = appConfig.getGeminiApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return ruleBasedFallback(report);
        }

        String desc = String.valueOf(report.getOrDefault("description", ""));
        String city = String.valueOf(report.getOrDefault("city", ""));
        String state = String.valueOf(report.getOrDefault("state", ""));
        Object lat = report.get("latitude");
        Object lng = report.get("longitude");
        String source = String.valueOf(report.getOrDefault("source", "Citizen Report"));

        String userContent = """
                Report to analyze:
                - Text: "%s"
                - Claimed City: %s
                - Claimed State: %s
                - Coordinates: Lat %s, Lng %s
                - Source: %s
                """.formatted(desc, city, state, lat, lng, source);

        List<String> candidateModels = List.of("gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash");
        for (String modelName : candidateModels) {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

            Map<String, Object> payload = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(
                                    Map.of("text", SYSTEM_PROMPT),
                                    Map.of("text", userContent)
                            )
                    )),
                    "generationConfig", Map.of(
                            "response_mime_type", "application/json",
                            "temperature", 0.2
                    )
            );

            try {
                String responseBody = webClient.post()
                        .uri(url)
                        .bodyValue(payload)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                JsonNode root = objectMapper.readTree(responseBody);
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    String textContent = candidates.get(0).path("content").path("parts").get(0).path("text").asText("");
                    JsonNode parsed = objectMapper.readTree(textContent);
                    return AiAnalysisResultDto.builder()
                            .eventType(parsed.path("event_type").asText("other").toLowerCase())
                            .severity(parsed.path("severity").asText("moderate").toLowerCase())
                            .locationDetected(parsed.path("location_detected").asText(city + ", " + state))
                            .credibility(parsed.path("credibility").asText("unverified").toLowerCase())
                            .confidence(parsed.path("confidence").asDouble(0.75))
                            .reason(parsed.path("reason").asText("Analyzed by Gemini AI (" + modelName + ")."))
                            .build();
                }
            } catch (Exception e) {
                logger.warn("Gemini call for model {} failed: {}", modelName, e.getMessage());
            }
        }

        return ruleBasedFallback(report);
    }

    public static String getSystemPrompt() {
        return SYSTEM_PROMPT;
    }
}
