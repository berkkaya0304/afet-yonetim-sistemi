package com.afet.userservice.controller;

import com.afet.userservice.dto.ManualBadgeAwardDto;
import com.afet.userservice.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/badges")
@RequiredArgsConstructor
public class AdminController {

    private final BadgeService badgeService;

    @PostMapping("/award")
    public ResponseEntity<Void> awardBadgeManually(@RequestBody ManualBadgeAwardDto dto) {
        badgeService.awardBadgeManually(dto.getUserId(), dto.getBadgeId());
        return ResponseEntity.ok().build();
    }
}