package com.nwap.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Lightweight map point for geo intelligence – matches Python's WeatherMapItem.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherMapItemDto {

    private Long id;
    private Double latitude;
    private Double longitude;
    private String city;
    private String state;

    @JsonProperty("event_type")
    private String eventType;

    private String severity;

    @JsonProperty("verification_status")
    private String verificationStatus;

    private Double rainfall;
    private Double temperature;
    private LocalDateTime timestamp;
}
