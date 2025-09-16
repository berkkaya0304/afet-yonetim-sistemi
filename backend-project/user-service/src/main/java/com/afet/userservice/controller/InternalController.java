package com.afet.userservice.controller;

import com.afet.userservice.service.BadgeService;
import com.afet.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/internal/users")
@RequiredArgsConstructor
public class InternalController {

    private final BadgeService badgeService;
    private final UserService userService;

    @PostMapping("/{userId}/task-completed")
    public ResponseEntity<Void> notifyTaskCompletion(@PathVariable Integer userId) {
        badgeService.processTaskCompletion(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/statistics/active-volunteers")
    public ResponseEntity<Long> getActiveVolunteers() {
        Long activeVolunteersCount = userService.getActiveVolunteersCount();
        return ResponseEntity.ok(activeVolunteersCount);
    }
}