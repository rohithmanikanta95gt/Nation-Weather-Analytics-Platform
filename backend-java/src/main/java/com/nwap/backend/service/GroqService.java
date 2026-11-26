package com.nwap.backend.service;

import com.nwap.backend.dto.AiAnalysisResultDto;
import com.nwap.backend.config.AppConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * Groq LLM service – Java equivalent of Python groq_service.py.
 * Uses llama-3.3-70b-versatile model via Groq's OpenAI-compatible API.
 */
@Service
public class GroqService {

    private static final Logger logger = LoggerFactory.getLogger(GroqService.class);

    private final AppConfig appConfig;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final GeminiService geminiService; // for shared fallback

    public GroqService(AppConfig appConfig, WebClient webClient,
                        ObjectMapper objectMapper, GeminiService geminiService) {
        this.appConfig = appConfig;
        this.webClient = webClient;
        this.objectMapper = objectMapper;
        this.geminiService = geminiService;
    }

    public AiAnalysisResultDto analyzeReport(Map<String, Object> report) {
        String apiKey = appConfig.getGroqApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return geminiService.ruleBasedFallback(report);
        }

        String desc = String.valueOf(report.getOrDefault("description", ""));
        String city = String.valueOf(report.getOrDefault("city", ""));
        String state = String.valueOf(report.getOrDefault("state", ""));
        Object lat = report.get("latitude");
        Object lng = report.get("longitude");

        String userContent = """
                Analyze this report and respond ONLY in valid JSON matching the instructions:
                - Description: "%s"
                - City: %s, State: %s
                - Lat: %s, Lng: %s
                """.formatted(desc, city, state, lat, lng);

        Map<String, Object> payload = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "system", "content", GeminiService.getSystemPrompt()),
                        Map.of("role", "user", "content", userContent)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.2
        );

        try {
            String responseBody = webClient.post()
                    .uri("https://api.groq.com/openai/v1/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0).path("message").path("content").asText("");
            JsonNode parsed = objectMapper.readTree(content);

            return AiAnalysisResultDto.builder()
                    .eventType(parsed.path("event_type").asText("other").toLowerCase())
                    .severity(parsed.path("severity").asText("moderate").toLowerCase())
                    .locationDetected(parsed.path("location_detected").asText(city + ", " + state))
                    .credibility(parsed.path("credibility").asText("unverified").toLowerCase())
                    .confidence(parsed.path("confidence").asDouble(0.80))
                    .reason(parsed.path("reason").asText("Analyzed by Groq LLM."))
                    .build();
        } catch (Exception e) {
            logger.warn("Groq API call failed, using rule-based fallback: {}", e.getMessage());
        }

        return geminiService.ruleBasedFallback(report);
    }
}
