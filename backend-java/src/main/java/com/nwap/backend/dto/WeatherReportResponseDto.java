package com.nwap.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Full weather report response DTO.
 * Maps to Python's WeatherReportResponse schema.
 * JSON field names MUST match what the Next.js frontend expects.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherReportResponseDto {

    private Long id;
    private String source;

    @JsonProperty("source_report_id")
    private String sourceReportId;

    private LocalDateTime timestamp;
    private String country;
    private String state;
    private String city;
    private String district;
    private Double latitude;
    private Double longitude;

    @JsonProperty("event_type")
    private String eventType;

    private String description;
    private Double temperature;
    private Double humidity;
    private Double rainfall;

    @JsonProperty("wind_speed")
    private Double windSpeed;

    private String severity;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("video_url")
    private String videoUrl;

    @JsonProperty("original_text")
    private String originalText;

    @JsonProperty("verification_status")
    private String verificationStatus;

    @JsonProperty("verification_score")
    private Double verificationScore;

    @JsonProperty("verification_reason")
    private String verificationReason;

    @JsonProperty("ai_confidence")
    private Double aiConfidence;

    @JsonProperty("duplicate_probability")
    private Double duplicateProbability;

    @JsonProperty("is_duplicate")
    private Boolean isDuplicate;

    @JsonProperty("duplicate_of_id")
    private Long duplicateOfId;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
