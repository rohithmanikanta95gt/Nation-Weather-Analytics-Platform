package com.nwap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Verification breakdown – matches Python's VerificationAnalytics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationAnalyticsDto {

    private long verified;
    private long unverified;
    private long suspicious;
    private long rejected;
    private long duplicate;
}
