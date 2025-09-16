package com.afet.informationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisasterTypeDto {
    private Integer id;
    private String name;
    private String description;
    private String severity;
    private String category;
}
