package com.afet.userservice.controller;

import com.afet.userservice.dto.ManualBadgeAwardDto;
import com.afet.userservice.dto.UserProfileDto;
import com.afet.userservice.entity.User;
import com.afet.userservice.service.BadgeService;
import com.afet.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('YONETICI')")
public class AdminController {

    private final BadgeService badgeService;
    private final UserService userService;

    @PostMapping("/badges/award")
    public ResponseEntity<Void> awardBadgeManually(@RequestBody ManualBadgeAwardDto dto) {
        badgeService.awardBadgeManually(dto.getUserId(), dto.getBadgeId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/all")
    public ResponseEntity<List<UserProfileDto>> getAllUsers() {
        List<UserProfileDto> users = userService.getAllUsers();
        return ResponseEntity.ok().body(users);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserProfileDto> getUserById(@PathVariable Integer userId) {
        UserProfileDto user = userService.getUserProfile(userId);
        return ResponseEntity.ok().body(user);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserProfileDto> updateUserRole(
            @PathVariable Integer userId,
            @RequestParam String newRole) {
        UserProfileDto updatedUser = userService.updateUserRole(userId, newRole);
        return ResponseEntity.ok().body(updatedUser);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = userService.getUserStats();
        return ResponseEntity.ok().body(stats);
    }

    @GetMapping("/volunteers")
    public ResponseEntity<List<UserProfileDto>> getVolunteers() {
        List<UserProfileDto> volunteers = userService.getAllUsers("GONULLU", null, null);
        return ResponseEntity.ok().body(volunteers);
    }

    @GetMapping("/badges")
    public ResponseEntity<List<com.afet.userservice.entity.Badge>> getAllBadges() {
        List<com.afet.userservice.entity.Badge> badges = badgeService.getAllBadges();
        return ResponseEntity.ok().body(badges);
    }

    @PostMapping("/badges")
    public ResponseEntity<com.afet.userservice.entity.Badge> createBadge(@RequestBody com.afet.userservice.entity.Badge badge) {
        com.afet.userservice.entity.Badge savedBadge = badgeService.createBadge(badge);
        return ResponseEntity.ok().body(savedBadge);
    }

    @DeleteMapping("/badges/{id}")
    public ResponseEntity<Void> deleteBadge(@PathVariable Integer id) {
        badgeService.deleteBadge(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/badges/assign")
    public ResponseEntity<Void> assignBadgeToUser(@Valid @RequestBody ManualBadgeAwardDto dto) {
        if (dto.getUserId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (dto.getBadgeId() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        badgeService.awardBadgeManually(dto.getUserId(), dto.getBadgeId());
        return ResponseEntity.ok().build();
    }
}