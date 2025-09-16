package com.afet.userservice.controller;

import com.afet.userservice.dto.UserProfileDto;
import com.afet.userservice.dto.UserUpdateDto;
import com.afet.userservice.entity.User;
import com.afet.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getMyProfile() {
        return ResponseEntity.ok(userService.getUserProfile(1));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserProfileDto> updateMyProfile(
            @RequestHeader("X-User-Id") Integer userId,
            @RequestBody UserUpdateDto updateDto) {
        return ResponseEntity.ok(userService.updateUserProfile(userId, updateDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDto> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileDto> updateUserById(
            @PathVariable Integer id,
            @RequestBody UserUpdateDto updateDto,
            @RequestHeader("X-User-Id") Integer currentUserId) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        System.out.println("Authentication: " + authentication);
        System.out.println("Authorities: " + authentication.getAuthorities());
        System.out.println("Current User ID: " + currentUserId);
        System.out.println("Target User ID: " + id);
        
        boolean isAdmin = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_YONETICI"));
        boolean isOwnProfile = currentUserId.equals(id);
        
        System.out.println("Is Admin: " + isAdmin);
        System.out.println("Is Own Profile: " + isOwnProfile);
        
        if (!isAdmin && !isOwnProfile) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(userService.updateUserProfile(id, updateDto));
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDto>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String skill) {
        return ResponseEntity.ok(userService.getAllUsers(role, active, skill));
    }
}
