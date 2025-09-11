package com.afet.requestservice.dto;

import com.afet.requestservice.entity.RequestType;
import com.afet.requestservice.entity.Urgency;
import lombok.Data;

@Data
public class CreateHelpRequestDto {
    private RequestType requestType;
    private String details;
    private Double latitude;
    private Double longitude;
    private Urgency urgency;
}