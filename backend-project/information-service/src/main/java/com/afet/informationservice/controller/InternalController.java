package com.afet.informationservice.controller;

import com.afet.informationservice.service.SafeZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/statistics")
@RequiredArgsConstructor
public class InternalController {

    private final SafeZoneService safeZoneService;

    @GetMapping("/safe-zones")
    public ResponseEntity<Long> getSafeZonesCount() {
        Long safeZonesCount = safeZoneService.getSafeZonesCount();
        return ResponseEntity.ok(safeZonesCount);
    }
}
