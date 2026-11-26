package com.nwap.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JPA Entity mapping to weather_alerts table.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "weather_alerts", indexes = {
        @Index(name = "idx_alert_code", columnList = "alert_code"),
        @Index(name = "idx_alert_event_type", columnList = "event_type"),
        @Index(name = "idx_alert_severity", columnList = "severity"),
        @Index(name = "idx_alert_state", columnList = "state"),
        @Index(name = "idx_alert_is_active", columnList = "is_active"),
})
public class WeatherAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "alert_code", unique = true, nullable = false, length = 50)
    private String alertCode;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    // warning, moderate, high, severe
    @Column(name = "severity", nullable = false, length = 20)
    private String severity;

    @Column(name = "location", nullable = false, length = 150)
    private String location;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "source", nullable = false, length = 100)
    private String source;

    @Column(name = "advisory_action", columnDefinition = "TEXT")
    private String advisoryAction;

    @Column(name = "affected_population", length = 100)
    private String affectedPopulation;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
