package com.afet.websocketservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmergencyAlertEvent {
    private Integer alertId;
    private String title;
    private String message;
    private String severity; // "LOW", "MEDIUM", "HIGH", "CRITICAL"
    private Double latitude;
    private Double longitude;
    private Integer requestId;
    private Long timestamp;
}
