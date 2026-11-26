package com.nwap.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * State-level analytics item – matches Python's StateAnalyticsItem.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StateAnalyticsItemDto {

    private String state;
    private long count;

    @JsonProperty("flood_count")
    private long floodCount;

    @JsonProperty("alerts_count")
    private long alertsCount;
}
