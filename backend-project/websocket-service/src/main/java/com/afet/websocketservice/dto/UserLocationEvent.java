package com.afet.websocketservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLocationEvent {
    private Integer userId;
    private String username;
    private Double latitude;
    private Double longitude;
    private String status; // "AVAILABLE", "BUSY", "OFFLINE"
    private Long timestamp;
}
