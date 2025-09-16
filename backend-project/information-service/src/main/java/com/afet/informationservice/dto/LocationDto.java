package com.afet.informationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationDto {
    private Integer id;
    private String name;
    private String description;
    private Double latitude;
    private Double longitude;
    private String address;
    private String type;
    private LocalDateTime createdAt;
}
