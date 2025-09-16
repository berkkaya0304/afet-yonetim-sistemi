package com.afet.requestservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HelpRequestDto implements Serializable {
    private Integer id;
    private Integer requesterId;
    private String requestType;
    private String details;
    private Double latitude;
    private Double longitude;
    private String status;
    private String urgency;
    private LocalDateTime createdAt;
}