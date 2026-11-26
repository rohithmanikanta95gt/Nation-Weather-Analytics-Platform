package com.nwap.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JPA Entity mapping to data_source_status table.
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "data_source_status", indexes = {
        @Index(name = "idx_dss_source", columnList = "source"),
})
public class DataSourceStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source", unique = true, nullable = false, length = 50)
    private String source;

    // online, streaming, delayed, not_configured, error
    @Column(name = "status", nullable = false, length = 20)
    private String status = "online";

    @Column(name = "last_sync")
    private LocalDateTime lastSync;

    @Column(name = "records_received", nullable = false)
    private Integer recordsReceived = 0;

    @Column(name = "latency_ms", nullable = false)
    private Double latencyMs = 0.0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "endpoint", length = 255)
    private String endpoint;
}
