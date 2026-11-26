package com.nwap.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Manual verification request DTO – matches Python's ManualVerificationRequest.
 */
@Data
public class ManualVerificationRequestDto {

    @NotBlank
    @Pattern(regexp = "^(verified|unverified|suspicious|rejected|duplicate)$",
            message = "Invalid verification_status value")
    @JsonProperty("verification_status")
    private String verificationStatus;

    @JsonProperty("verification_reason")
    private String verificationReason;
}
