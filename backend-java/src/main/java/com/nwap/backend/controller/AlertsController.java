package com.nwap.backend.controller;

import com.nwap.backend.dto.AlertCreateDto;
import com.nwap.backend.dto.WeatherAlertResponseDto;
import com.nwap.backend.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Alerts controller – matches Python's /api/alerts/* endpoints exactly.
 */
@Tag(name = "Live Alerts", description = "Emergency weather and disaster alert management")
@RestController
@RequestMapping("/api/alerts")
public class AlertsController {

    private final AlertService alertService;

    public AlertsController(AlertService alertService) {
        this.alertService = alertService;
    }

    @Operation(summary = "Retrieve active disaster and weather alerts")
    @GetMapping("")
    public ResponseEntity<List<WeatherAlertResponseDto>> getAlerts(
            @RequestParam(defaultValue = "true") boolean is_active,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String state) {
        return ResponseEntity.ok(alertService.getAlerts(is_active, severity, state));
    }

    @Operation(summary = "Broadcast emergency disaster advisory")
    @PostMapping("")
    public ResponseEntity<WeatherAlertResponseDto> broadcastAlert(
            @Valid @RequestBody AlertCreateDto alertIn) {
        WeatherAlertResponseDto created = alertService.broadcastAlert(
                alertIn.getAlertCode(),
                alertIn.getEventType(),
                alertIn.getSeverity(),
                alertIn.getLocation(),
                alertIn.getDistrict(),
                alertIn.getState(),
                alertIn.getDescription(),
                alertIn.getSource() != null ? alertIn.getSource() : "National Disaster Management Authority (NDMA)",
                alertIn.getAdvisoryAction(),
                alertIn.getAffectedPopulation(),
                alertIn.getLatitude(),
                alertIn.getLongitude(),
                alertIn.getExpiresAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
