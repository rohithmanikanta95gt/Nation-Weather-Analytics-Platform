package com.nwap.backend.controller;

import com.nwap.backend.service.OpenMeteoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Weather API controller – matches Python's /api/weather/* endpoints.
 * Endpoint paths exactly mirror FastAPI routes for frontend compatibility.
 */
@Tag(name = "Weather", description = "Real-time weather and forecast endpoints")
@RestController
@RequestMapping("/api/weather")
@Validated
public class WeatherController {

    private final OpenMeteoService openMeteoService;

    public WeatherController(OpenMeteoService openMeteoService) {
        this.openMeteoService = openMeteoService;
    }

    @Operation(summary = "Fetch real-time current weather conditions")
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> fetchCurrentWeather(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") double latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") double longitude) {
        try {
            return ResponseEntity.ok(openMeteoService.getCurrentWeather(latitude, longitude));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of(
                    "detail", "Failed to fetch live weather: " + e.getMessage()));
        }
    }

    @Operation(summary = "Fetch multi-day weather forecast")
    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> fetchForecast(
            @RequestParam @DecimalMin("-90.0") @DecimalMax("90.0") double latitude,
            @RequestParam @DecimalMin("-180.0") @DecimalMax("180.0") double longitude,
            @RequestParam(defaultValue = "3") int days) {
        if (days < 1 || days > 7) {
            return ResponseEntity.badRequest().body(Map.of("detail", "days must be between 1 and 7"));
        }
        try {
            return ResponseEntity.ok(openMeteoService.getForecast(latitude, longitude, days));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of(
                    "detail", "Forecast service error: " + e.getMessage()));
        }
    }
}
