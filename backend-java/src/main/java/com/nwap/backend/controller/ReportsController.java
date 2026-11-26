package com.nwap.backend.controller;

import com.nwap.backend.dto.*;
import com.nwap.backend.service.IngestionService;
import com.nwap.backend.service.WeatherDataService;
import com.nwap.backend.util.DtoMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Reports controller – matches Python's /api/reports/* endpoints exactly.
 */
@Tag(name = "Weather Reports", description = "CRUD and pipeline for weather reports")
@RestController
@RequestMapping("/api/reports")
public class ReportsController {

    private final WeatherDataService weatherDataService;
    private final IngestionService ingestionService;

    public ReportsController(WeatherDataService weatherDataService, IngestionService ingestionService) {
        this.weatherDataService = weatherDataService;
        this.ingestionService = ingestionService;
    }

    @Operation(summary = "Query and filter weather reports")
    @GetMapping("")
    public ResponseEntity<PaginatedReportsResponseDto> getReports(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start_date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end_date,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String event_type,
            @RequestParam(required = false) String verification_status,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        if (page < 1) page = 1;
        if (limit < 1) limit = 1;
        if (limit > 100) limit = 100;

        return ResponseEntity.ok(weatherDataService.getReports(
                start_date, end_date, state, city, district,
                event_type, verification_status, source, severity, search,
                page, limit));
    }

    @Operation(summary = "Submit a citizen weather report")
    @PostMapping("")
    public ResponseEntity<WeatherReportResponseDto> createCitizenReport(
            @Valid @RequestBody CitizenReportCreateDto reportIn) {

        Map<String, Object> reportDict = new HashMap<>();
        reportDict.put("description", reportIn.getDescription());
        reportDict.put("city", reportIn.getCity());
        reportDict.put("state", reportIn.getState());
        reportDict.put("district", reportIn.getDistrict());
        reportDict.put("latitude", reportIn.getLatitude());
        reportDict.put("longitude", reportIn.getLongitude());
        reportDict.put("timestamp", reportIn.getTimestamp() != null ? reportIn.getTimestamp() : LocalDateTime.now());
        reportDict.put("image_url", reportIn.getImageUrl());
        reportDict.put("video_url", reportIn.getVideoUrl());
        reportDict.put("event_type", reportIn.getEventType());
        reportDict.put("source", reportIn.getSource() != null ? reportIn.getSource() : "Citizen Report");

        var saved = ingestionService.processAndSaveCitizenReport(reportDict);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toReportResponse(saved));
    }

    @Operation(summary = "Get lightweight reports for India map")
    @GetMapping("/map")
    public ResponseEntity<List<WeatherMapItemDto>> getMapReports(
            @RequestParam(required = false) String event_type) {
        return ResponseEntity.ok(weatherDataService.getMapReports(event_type));
    }

    @Operation(summary = "Get full details for a single report")
    @GetMapping("/{report_id}")
    public ResponseEntity<WeatherReportResponseDto> getReportById(@PathVariable Long report_id) {
        WeatherReportResponseDto dto = weatherDataService.getReportById(report_id);
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Weather report #" + report_id + " not found.");
        }
        return ResponseEntity.ok(dto);
    }
}
