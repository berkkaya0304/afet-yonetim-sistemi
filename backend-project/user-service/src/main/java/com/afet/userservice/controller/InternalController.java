package com.afet.userservice.controller;

import com.afet.userservice.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/internal/users")
@RequiredArgsConstructor
public class InternalController {

    private final BadgeService badgeService;

    @PostMapping("/{userId}/task-completed")
    public ResponseEntity<Void> notifyTaskCompletion(@PathVariable Integer userId) {
        badgeService.processTaskCompletion(userId);
        return ResponseEntity.ok().build();
    }
}