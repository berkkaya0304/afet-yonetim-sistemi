package com.afet.informationservice.controller;

import com.afet.informationservice.dto.SafeZoneDto;
import com.afet.informationservice.dto.CreateSafeZoneDto;
import com.afet.informationservice.dto.UpdateSafeZoneDto;
import com.afet.informationservice.service.SafeZoneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/safezones")
@RequiredArgsConstructor
public class SafeZoneController {

    private final SafeZoneService safeZoneService;


    @GetMapping
    public ResponseEntity<List<SafeZoneDto>> getAllSafeZones() {
        return ResponseEntity.ok(safeZoneService.getAllSafeZones());
    }


    @GetMapping("/active")
    public ResponseEntity<List<SafeZoneDto>> getActiveSafeZones() {
        return ResponseEntity.ok(safeZoneService.getActiveSafeZones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SafeZoneDto> getSafeZoneById(@PathVariable Integer id) {
        return ResponseEntity.ok(safeZoneService.getSafeZoneById(id));
    }


    @GetMapping("/search")
    public ResponseEntity<List<SafeZoneDto>> searchSafeZonesByName(@RequestParam String name) {
        return ResponseEntity.ok(safeZoneService.searchSafeZonesByName(name));
    }


    @GetMapping("/nearby")
    public ResponseEntity<List<SafeZoneDto>> getSafeZonesNearLocation(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radiusKm) {
        return ResponseEntity.ok(safeZoneService.getSafeZonesNearLocation(latitude, longitude, radiusKm));
    }

    @PostMapping
    public ResponseEntity<SafeZoneDto> createSafeZone(@Valid @RequestBody CreateSafeZoneDto createSafeZoneDto) {
        SafeZoneDto createdSafeZone = safeZoneService.createSafeZone(createSafeZoneDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSafeZone);
    }


    @PutMapping("/{id}")
    public ResponseEntity<SafeZoneDto> updateSafeZone(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateSafeZoneDto updateSafeZoneDto) {
        SafeZoneDto updatedSafeZone = safeZoneService.updateSafeZone(id, updateSafeZoneDto);
        return ResponseEntity.ok(updatedSafeZone);
    }


    @PatchMapping("/{id}/activate")
    public ResponseEntity<SafeZoneDto> activateSafeZone(@PathVariable Integer id) {
        SafeZoneDto activatedSafeZone = safeZoneService.activateSafeZone(id);
        return ResponseEntity.ok(activatedSafeZone);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<SafeZoneDto> deactivateSafeZone(@PathVariable Integer id) {
        SafeZoneDto deactivatedSafeZone = safeZoneService.deactivateSafeZone(id);
        return ResponseEntity.ok(deactivatedSafeZone);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSafeZone(@PathVariable Integer id) {
        safeZoneService.deleteSafeZone(id);
        return ResponseEntity.noContent().build();
    }


    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeleteSafeZone(@PathVariable Integer id) {
        safeZoneService.hardDeleteSafeZone(id);
        return ResponseEntity.noContent().build();
    }
}
