package com.nwap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Paginated reports list – matches Python's PaginatedReportsResponse.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginatedReportsResponseDto {

    private List<WeatherReportResponseDto> items;
    private long total;
    private int page;
    private int limit;
}
