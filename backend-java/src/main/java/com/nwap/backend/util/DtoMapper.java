package com.nwap.backend.util;

import com.nwap.backend.entity.WeatherReport;
import com.nwap.backend.dto.WeatherReportResponseDto;
import com.nwap.backend.dto.WeatherMapItemDto;
import com.nwap.backend.entity.WeatherAlert;
import com.nwap.backend.dto.WeatherAlertResponseDto;
import com.nwap.backend.entity.DataSourceStatus;
import com.nwap.backend.dto.DataSourceStatusResponseDto;

/**
 * Mapper utility to convert entities to DTOs.
 * Avoids MapStruct dependency while keeping code clean.
 */
public class DtoMapper {

    private DtoMapper() {}

    public static WeatherReportResponseDto toReportResponse(WeatherReport r) {
        return WeatherReportResponseDto.builder()
                .id(r.getId())
                .source(r.getSource())
                .sourceReportId(r.getSourceReportId())
                .timestamp(r.getTimestamp())
                .country(r.getCountry())
                .state(r.getState())
                .city(r.getCity())
                .district(r.getDistrict())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .eventType(r.getEventType())
                .description(r.getDescription())
                .temperature(r.getTemperature())
                .humidity(r.getHumidity())
                .rainfall(r.getRainfall())
                .windSpeed(r.getWindSpeed())
                .severity(r.getSeverity())
                .imageUrl(r.getImageUrl())
                .videoUrl(r.getVideoUrl())
                .originalText(r.getOriginalText())
                .verificationStatus(r.getVerificationStatus())
                .verificationScore(r.getVerificationScore())
                .verificationReason(r.getVerificationReason())
                .aiConfidence(r.getAiConfidence())
                .duplicateProbability(r.getDuplicateProbability())
                .isDuplicate(r.getIsDuplicate())
                .duplicateOfId(r.getDuplicateOfId())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    public static WeatherMapItemDto toMapItem(WeatherReport r) {
        return WeatherMapItemDto.builder()
                .id(r.getId())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .city(r.getCity())
                .state(r.getState())
                .eventType(r.getEventType())
                .severity(r.getSeverity())
                .verificationStatus(r.getVerificationStatus())
                .rainfall(r.getRainfall())
                .temperature(r.getTemperature())
                .timestamp(r.getTimestamp())
                .build();
    }

    public static WeatherAlertResponseDto toAlertResponse(WeatherAlert a) {
        return WeatherAlertResponseDto.builder()
                .id(a.getId())
                .alertCode(a.getAlertCode())
                .eventType(a.getEventType())
                .severity(a.getSeverity())
                .location(a.getLocation())
                .district(a.getDistrict())
                .state(a.getState())
                .description(a.getDescription())
                .source(a.getSource())
                .advisoryAction(a.getAdvisoryAction())
                .affectedPopulation(a.getAffectedPopulation())
                .latitude(a.getLatitude())
                .longitude(a.getLongitude())
                .issuedAt(a.getIssuedAt())
                .expiresAt(a.getExpiresAt())
                .isActive(a.getIsActive())
                .build();
    }

    public static DataSourceStatusResponseDto toSourceStatusResponse(DataSourceStatus s) {
        return DataSourceStatusResponseDto.builder()
                .source(s.getSource())
                .status(s.getStatus())
                .lastSync(s.getLastSync())
                .recordsReceived(s.getRecordsReceived())
                .latencyMs(s.getLatencyMs())
                .endpoint(s.getEndpoint())
                .build();
    }
}
