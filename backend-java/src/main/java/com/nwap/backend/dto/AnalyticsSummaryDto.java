package com.nwap.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard KPI summary – matches Python's AnalyticsSummary.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDto {

    @JsonProperty("total_reports")
    private long totalReports;

    @JsonProperty("verified_reports")
    private long verifiedReports;

    @JsonProperty("unverified_reports")
    private long unverifiedReports;

    @JsonProperty("suspicious_reports")
    private long suspiciousReports;

    @JsonProperty("duplicate_reports")
    private long duplicateReports;

    @JsonProperty("active_alerts")
    private long activeAlerts;

    @JsonProperty("reports_today")
    private long reportsToday;
}
