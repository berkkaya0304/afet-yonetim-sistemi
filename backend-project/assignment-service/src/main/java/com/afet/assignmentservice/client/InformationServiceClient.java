package com.afet.assignmentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "information-service")
public interface InformationServiceClient {

    @GetMapping("/api/v1/internal/statistics/safe-zones")
    Long getSafeZonesCount();
}
