package com.nwap.backend.controller;

import com.nwap.backend.dto.DataSourceStatusResponseDto;
import com.nwap.backend.dto.ManualVerificationRequestDto;
import com.nwap.backend.dto.WeatherReportResponseDto;
import com.nwap.backend.service.AlertService;
import com.nwap.backend.service.IngestionService;
import com.nwap.backend.service.WeatherDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Verification & data sources controller.
 * Matches Python's /api/verify/*, /api/sources/status, /api/ingestion/run endpoints.
 */
@Tag(name = "Verification & Data Sources", description = "Report moderation, source health, and manual ingestion triggers")
@RestController
public class VerificationController {

    private final WeatherDataService weatherDataService;
    private final AlertService alertService;
    private final IngestionService ingestionService;

    public VerificationController(WeatherDataService weatherDataService,
                                   AlertService alertService,
                                   IngestionService ingestionService) {
        this.weatherDataService = weatherDataService;
        this.alertService = alertService;
        this.ingestionService = ingestionService;
    }

    @Operation(summary = "Manually verify, reject, or flag a report")
    @PostMapping("/api/verify/{report_id}")
    public ResponseEntity<WeatherReportResponseDto> updateReportVerification(
            @PathVariable Long report_id,
            @Valid @RequestBody ManualVerificationRequestDto verifIn) {

        WeatherReportResponseDto updated = weatherDataService.updateVerificationStatus(
                report_id, verifIn.getVerificationStatus(), verifIn.getVerificationReason());

        if (updated == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Report #" + report_id + " not found.");
        }
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Data source health and sync status")
    @GetMapping("/api/sources/status")
    public ResponseEntity<List<DataSourceStatusResponseDto>> getSourcesStatus() {
        return ResponseEntity.ok(alertService.getSourcesStatus());
    }

    @Operation(summary = "Trigger manual data ingestion run")
    @PostMapping("/api/ingestion/run")
    public ResponseEntity<Map<String, Object>> triggerIngestion() {
        Map<String, Object> result = ingestionService.runBackgroundIngestion();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Manual data ingestion pipeline executed successfully.",
                "details", result
        ));
    }
}
