package com.nwap.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data source health response – matches Python's DataSourceStatusResponse.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataSourceStatusResponseDto {

    private String source;
    private String status;

    @JsonProperty("last_sync")
    private LocalDateTime lastSync;

    @JsonProperty("records_received")
    private Integer recordsReceived;

    @JsonProperty("latency_ms")
    private Double latencyMs;

    private String endpoint;
}
