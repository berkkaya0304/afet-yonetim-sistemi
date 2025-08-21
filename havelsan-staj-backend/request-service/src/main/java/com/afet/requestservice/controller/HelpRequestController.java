package com.afet.requestservice.controller;

import com.afet.requestservice.dto.CreateHelpRequestDto;
import com.afet.requestservice.dto.HelpRequestDto;
import com.afet.requestservice.service.HelpRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.afet.requestservice.dto.UpdateStatusDto; // Yeni bir DTO oluşturman gerekecek


import java.util.List;

@RestController
@RequestMapping("/api/v1/help-requests")
@RequiredArgsConstructor
public class HelpRequestController {


    private final HelpRequestService service;

    @PostMapping
    public ResponseEntity<HelpRequestDto> createRequest(
            @RequestBody CreateHelpRequestDto dto,
            @RequestHeader("X-User-Id") Integer userId) {
        HelpRequestDto createdRequest = service.createHelpRequest(dto, userId);
        return new ResponseEntity<>(createdRequest, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<HelpRequestDto>> getMyRequests(
            @RequestHeader("X-User-Id") Integer userId) { // Giriş yapmış kullanıcının ID'si
        return ResponseEntity.ok(service.getRequestsForUser(userId));
    }

    @GetMapping
    public ResponseEntity<List<HelpRequestDto>> getAllRequests() {
        // TODO: Buraya rol kontrolü eklenebilir. (Örn: @RequestHeader("X-User-Roles"))
        return ResponseEntity.ok(service.getAllRequests());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateRequestStatus(
            @PathVariable Integer id,
            @RequestBody UpdateStatusDto statusDto) {
        service.updateStatus(id, statusDto.getStatus());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/admin/{id}/status")
    public ResponseEntity<Void> updateRequestStatusByAdmin(
            @PathVariable Integer id,
            @RequestBody UpdateStatusDto statusDto,
            @RequestHeader("X-User-Id") Integer adminId) {

        service.updateStatusByAdmin(id, statusDto.getStatus());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<HelpRequestDto>> getNearbyRequests(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "5000") int radius) {

        return ResponseEntity.ok(service.findNearbyRequests(lat, lon, radius));
    }
}