package com.nwap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Time-series item – matches Python's TimelineItem.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineItemDto {

    private String period;
    private long reports;
    private long verified;
}
