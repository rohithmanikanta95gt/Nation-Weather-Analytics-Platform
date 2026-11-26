package com.nwap.backend.service;

import com.nwap.backend.config.AppConfig;
import com.nwap.backend.dto.WeatherAlertResponseDto;
import com.nwap.backend.entity.DataSourceStatus;
import com.nwap.backend.entity.WeatherAlert;
import com.nwap.backend.repository.DataSourceStatusRepository;
import com.nwap.backend.repository.WeatherAlertRepository;
import com.nwap.backend.util.DtoMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Alert and data source status management service.
 */
@Service
public class AlertService {

    private final WeatherAlertRepository alertRepository;
    private final DataSourceStatusRepository sourceStatusRepository;
    private final AppConfig appConfig;

    public AlertService(WeatherAlertRepository alertRepository,
                         DataSourceStatusRepository sourceStatusRepository,
                         AppConfig appConfig) {
        this.alertRepository = alertRepository;
        this.sourceStatusRepository = sourceStatusRepository;
        this.appConfig = appConfig;
    }

    public List<WeatherAlertResponseDto> getAlerts(boolean isActive, String severity, String state) {
        // Normalize "all" filters to null
        String severityFilter = (severity != null && !severity.equalsIgnoreCase("all")) ? severity.strip() : null;
        String stateFilter = (state != null && !state.equalsIgnoreCase("all states")) ? state.strip() : null;

        List<WeatherAlert> alerts = alertRepository.findFiltered(isActive, severityFilter, stateFilter);
        return alerts.stream().map(DtoMapper::toAlertResponse).collect(Collectors.toList());
    }

    @Transactional
    public WeatherAlertResponseDto broadcastAlert(String alertCode, String eventType, String severity,
                                                   String location, String district, String state,
                                                   String description, String source,
                                                   String advisoryAction, String affectedPopulation,
                                                   Double latitude, Double longitude,
                                                   LocalDateTime expiresAt) {
        String code = (alertCode != null && !alertCode.isBlank())
                ? alertCode
                : "ALT-IN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();

        WeatherAlert alert = new WeatherAlert();
        alert.setAlertCode(code);
        alert.setEventType(eventType);
        alert.setSeverity(severity);
        alert.setLocation(location);
        alert.setDistrict(district);
        alert.setState(state);
        alert.setDescription(description);
        alert.setSource(source);
        alert.setAdvisoryAction(advisoryAction);
        alert.setAffectedPopulation(affectedPopulation);
        alert.setLatitude(latitude);
        alert.setLongitude(longitude);
        alert.setIssuedAt(LocalDateTime.now());
        alert.setExpiresAt(expiresAt);
        alert.setIsActive(true);

        alertRepository.save(alert);
        return DtoMapper.toAlertResponse(alert);
    }

    /**
     * Ensure default data source status records exist (matches Python's verification.py behavior).
     */
    @Transactional
    public List<com.nwap.backend.dto.DataSourceStatusResponseDto> getSourcesStatus() {
        record DefaultSource(String source, String status, String endpoint, double latency, int recs) {}
        List<DefaultSource> defaults = List.of(
                new DefaultSource("Open-Meteo",          "online",         "api.open-meteo.com/v1/forecast",        45.0, 2400),
                new DefaultSource("OpenWeather",          "online",         "api.openweathermap.org/data/2.5",      115.0, 1800),
                new DefaultSource("Social Media (NLP)",   "streaming",      "stream.nwap.gov.in/social/feed",       180.0, 3204),
                new DefaultSource("Citizen Reports",      "delayed",        "citizen.nwap.gov.in/api/v1/reports",   340.0, 1521),
                new DefaultSource("IMD",                  "not_configured", "api.imd.gov.in/v2/telemetry",           0.0,    0)
        );

        for (DefaultSource d : defaults) {
            if (sourceStatusRepository.findBySource(d.source()).isEmpty()) {
                DataSourceStatus s = new DataSourceStatus();
                s.setSource(d.source());
                s.setStatus(d.source().equals("IMD")
                        ? (appConfig.getImdApiKey() != null && !appConfig.getImdApiKey().isBlank() ? "online" : "not_configured")
                        : d.status());
                s.setEndpoint(d.endpoint());
                s.setLatencyMs(d.latency());
                s.setRecordsReceived(d.recs());
                s.setLastSync(LocalDateTime.now());
                sourceStatusRepository.save(s);
            }
        }

        return sourceStatusRepository.findAll().stream()
                .map(DtoMapper::toSourceStatusResponse)
                .collect(Collectors.toList());
    }
}
