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
@RequestMapping("/api/v1/admin/safezones")
@RequiredArgsConstructor
public class AdminSafeZoneController {

    private final SafeZoneService safeZoneService;


    @GetMapping
    public ResponseEntity<List<SafeZoneDto>> getAllSafeZonesAdmin() {
        return ResponseEntity.ok(safeZoneService.getAllSafeZones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SafeZoneDto> getSafeZoneByIdAdmin(@PathVariable Integer id) {
        return ResponseEntity.ok(safeZoneService.getSafeZoneById(id));
    }

    @PostMapping
    public ResponseEntity<SafeZoneDto> createSafeZoneAdmin(@Valid @RequestBody CreateSafeZoneDto createSafeZoneDto) {
        SafeZoneDto createdSafeZone = safeZoneService.createSafeZone(createSafeZoneDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSafeZone);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SafeZoneDto> updateSafeZoneAdmin(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateSafeZoneDto updateSafeZoneDto) {
        SafeZoneDto updatedSafeZone = safeZoneService.updateSafeZone(id, updateSafeZoneDto);
        return ResponseEntity.ok(updatedSafeZone);
    }


    @PatchMapping("/{id}/activate")
    public ResponseEntity<SafeZoneDto> activateSafeZoneAdmin(@PathVariable Integer id) {
        SafeZoneDto activatedSafeZone = safeZoneService.activateSafeZone(id);
        return ResponseEntity.ok(activatedSafeZone);
    }


    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<SafeZoneDto> deactivateSafeZoneAdmin(@PathVariable Integer id) {
        SafeZoneDto deactivatedSafeZone = safeZoneService.deactivateSafeZone(id);
        return ResponseEntity.ok(deactivatedSafeZone);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSafeZoneAdmin(@PathVariable Integer id) {
        safeZoneService.deleteSafeZone(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeleteSafeZoneAdmin(@PathVariable Integer id) {
        safeZoneService.hardDeleteSafeZone(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/bulk/activate")
    public ResponseEntity<List<SafeZoneDto>> bulkActivateSafeZones(@RequestBody List<Integer> ids) {
        List<SafeZoneDto> activatedSafeZones = ids.stream()
                .map(safeZoneService::activateSafeZone)
                .toList();
        return ResponseEntity.ok(activatedSafeZones);
    }

    @PatchMapping("/bulk/deactivate")
    public ResponseEntity<List<SafeZoneDto>> bulkDeactivateSafeZones(@RequestBody List<Integer> ids) {
        List<SafeZoneDto> deactivatedSafeZones = ids.stream()
                .map(safeZoneService::deactivateSafeZone)
                .toList();
        return ResponseEntity.ok(deactivatedSafeZones);
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Void> bulkDeleteSafeZones(@RequestBody List<Integer> ids) {
        ids.forEach(safeZoneService::deleteSafeZone);
        return ResponseEntity.noContent().build();
    }
}
