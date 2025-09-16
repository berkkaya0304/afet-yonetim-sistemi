package com.afet.requestservice.dto;

import com.afet.requestservice.dto.Enum.RequestType;
import com.afet.requestservice.dto.Enum.Urgency;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateHelpRequestDto {
    private RequestType requestType;
    private String details;
    private Double latitude;
    private Double longitude;
    private Urgency urgency;
}