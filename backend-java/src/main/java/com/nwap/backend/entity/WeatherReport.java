package com.nwap.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA Entity mapping to weather_reports table.
 * Mirrors Python SQLAlchemy WeatherReport model exactly.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "weather_reports", indexes = {
        @Index(name = "idx_report_coords", columnList = "latitude,longitude"),
        @Index(name = "idx_report_time_event", columnList = "timestamp,event_type"),
        @Index(name = "idx_source", columnList = "source"),
        @Index(name = "idx_state", columnList = "state"),
        @Index(name = "idx_city", columnList = "city"),
        @Index(name = "idx_event_type", columnList = "event_type"),
        @Index(name = "idx_verification_status", columnList = "verification_status"),
        @Index(name = "idx_is_duplicate", columnList = "is_duplicate"),
        @Index(name = "idx_timestamp", columnList = "timestamp"),
})
public class WeatherReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source", nullable = false, length = 50)
    private String source = "Citizen Report";

    @Column(name = "source_report_id", length = 100)
    private String sourceReportId;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "country", nullable = false, length = 50)
    private String country = "India";

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    // rainfall, thunderstorm, flood, heatwave, fog, dust_storm, strong_wind, cyclone, other
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType = "other";

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "humidity")
    private Double humidity;

    @Column(name = "rainfall")
    private Double rainfall; // mm

    @Column(name = "wind_speed")
    private Double windSpeed; // km/h

    // low, moderate, high, severe, extreme
    @Column(name = "severity", nullable = false, length = 20)
    private String severity = "moderate";

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "original_text", columnDefinition = "TEXT")
    private String originalText;

    // verified, unverified, suspicious, rejected, duplicate
    @Column(name = "verification_status", nullable = false, length = 20)
    private String verificationStatus = "unverified";

    @Column(name = "verification_score", nullable = false)
    private Double verificationScore = 0.5;

    @Column(name = "verification_reason", columnDefinition = "TEXT")
    private String verificationReason;

    @Column(name = "ai_confidence", nullable = false)
    private Double aiConfidence = 0.0;

    @Column(name = "duplicate_probability", nullable = false)
    private Double duplicateProbability = 0.0;

    @Column(name = "is_duplicate", nullable = false)
    private Boolean isDuplicate = false;

    @Column(name = "duplicate_of_id")
    private Long duplicateOfId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
