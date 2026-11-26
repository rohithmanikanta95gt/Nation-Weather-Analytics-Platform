package com.nwap.backend.controller;

import com.nwap.backend.dto.*;
import com.nwap.backend.service.WeatherDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Analytics controller – matches Python's /api/analytics/* endpoints exactly.
 */
@Tag(name = "Analytics", description = "Platform analytics, KPIs, event distributions, and timelines")
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final WeatherDataService weatherDataService;

    public AnalyticsController(WeatherDataService weatherDataService) {
        this.weatherDataService = weatherDataService;
    }

    @Operation(summary = "Dashboard KPI metrics summary")
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDto> getAnalyticsSummary() {
        return ResponseEntity.ok(weatherDataService.getAnalyticsSummary());
    }

    @Operation(summary = "Event category distribution")
    @GetMapping("/events")
    public ResponseEntity<List<EventDistributionItemDto>> getEventDistribution() {
        return ResponseEntity.ok(weatherDataService.getEventDistribution());
    }

    @Operation(summary = "State-wise incident counts")
    @GetMapping("/states")
    public ResponseEntity<List<StateAnalyticsItemDto>> getStateAnalytics() {
        return ResponseEntity.ok(weatherDataService.getStateAnalytics());
    }

    @Operation(summary = "Time-series influx trend")
    @GetMapping("/timeline")
    public ResponseEntity<List<TimelineItemDto>> getTimelineAnalytics(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(weatherDataService.getTimelineAnalytics(days));
    }

    @Operation(summary = "Verification breakdown stats")
    @GetMapping("/verification")
    public ResponseEntity<VerificationAnalyticsDto> getVerificationAnalytics() {
        return ResponseEntity.ok(weatherDataService.getVerificationAnalytics());
    }
}
