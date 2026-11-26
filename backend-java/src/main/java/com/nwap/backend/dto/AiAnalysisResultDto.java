package com.nwap.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AI analysis result DTO – mirrors Python's AIAnalysisResult schema.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResultDto {

    private String eventType;
    private String severity;
    private String locationDetected;
    private String credibility; // verified | unverified | suspicious | rejected
    private double confidence;
    private String reason;
}
