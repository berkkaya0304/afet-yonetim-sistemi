package com.afet.informationservice.controller;

import com.afet.informationservice.dto.CreateAnnouncementDto;
import com.afet.informationservice.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/announcements")
@RequiredArgsConstructor
public class AdminController {

    private final AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<Void> createAnnouncement(
            @RequestBody CreateAnnouncementDto dto,
            @RequestHeader("X-User-Id") Integer adminId) {
        announcementService.create(dto, adminId);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}