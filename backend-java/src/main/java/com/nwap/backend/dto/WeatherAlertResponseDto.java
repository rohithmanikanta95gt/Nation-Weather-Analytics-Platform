package com.nwap.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Alert response DTO – matches Python's WeatherAlertResponse.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherAlertResponseDto {

    private Long id;

    @JsonProperty("alert_code")
    private String alertCode;

    @JsonProperty("event_type")
    private String eventType;

    private String severity;
    private String location;
    private String district;
    private String state;
    private String description;
    private String source;

    @JsonProperty("advisory_action")
    private String advisoryAction;

    @JsonProperty("affected_population")
    private String affectedPopulation;

    private Double latitude;
    private Double longitude;

    @JsonProperty("issued_at")
    private LocalDateTime issuedAt;

    @JsonProperty("expires_at")
    private LocalDateTime expiresAt;

    @JsonProperty("is_active")
    private Boolean isActive;
}
