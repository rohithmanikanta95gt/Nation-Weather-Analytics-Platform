package com.nwap.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Request DTO for creating a new alert.
 * Maps to Python's AlertCreate schema.
 */
@Data
public class AlertCreateDto {

    @JsonProperty("alert_code")
    private String alertCode;

    @NotBlank
    @JsonProperty("event_type")
    private String eventType;

    @NotBlank
    private String severity;

    @NotBlank
    private String location;

    private String district;

    @NotBlank
    private String state;

    @NotBlank
    private String description;

    private String source = "National Disaster Management Authority (NDMA)";

    @JsonProperty("advisory_action")
    private String advisoryAction;

    @JsonProperty("affected_population")
    private String affectedPopulation;

    private Double latitude;
    private Double longitude;

    @JsonProperty("expires_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime expiresAt;
}
