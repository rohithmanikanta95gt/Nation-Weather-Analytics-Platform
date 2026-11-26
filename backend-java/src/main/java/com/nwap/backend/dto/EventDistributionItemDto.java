package com.nwap.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event category distribution item – matches Python's EventDistributionItem.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDistributionItemDto {

    @JsonProperty("event_type")
    private String eventType;

    private long count;
    private double percentage;
}
