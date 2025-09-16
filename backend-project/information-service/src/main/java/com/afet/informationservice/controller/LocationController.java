package com.afet.informationservice.controller;

import com.afet.informationservice.dto.LocationDto;
import com.afet.informationservice.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    public ResponseEntity<LocationDto> createLocation(@RequestBody LocationDto locationDto) {
        return ResponseEntity.ok(locationService.createLocation(locationDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationDto> getLocationById(@PathVariable Integer id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }
}
