package com.afet.userservice.controller;

import com.afet.userservice.dto.AuthResponse;
import com.afet.userservice.dto.LoginRequest;
import com.afet.userservice.dto.RegisterRequest;
import com.afet.userservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/debug/register")
    public ResponseEntity<Map<String, Object>> debugRegister(@RequestBody RegisterRequest request) {
        // Debug için register işlemini detaylı logla
        System.out.println("DEBUG: Register request received");
        System.out.println("DEBUG: fullName = " + request.getFullName());
        System.out.println("DEBUG: email = " + request.getEmail());
        System.out.println("DEBUG: role = " + request.getRole());
        System.out.println("DEBUG: role type = " + (request.getRole() != null ? request.getRole().getClass().getName() : "null"));
        
        // Role'ü enum'a çevir
        com.afet.userservice.dto.Enum.Role userRole = com.afet.userservice.dto.Enum.Role.VATANDAS;
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            try {
                userRole = com.afet.userservice.dto.Enum.Role.valueOf(request.getRole().toUpperCase());
                System.out.println("DEBUG: Converted role = " + userRole);
            } catch (IllegalArgumentException e) {
                System.out.println("DEBUG: Invalid role, using default: " + e.getMessage());
                userRole = com.afet.userservice.dto.Enum.Role.VATANDAS;
            }
        }
        
        return ResponseEntity.ok(Map.of(
            "message", "Debug register completed",
            "requestedRole", request.getRole(),
            "convertedRole", userRole.toString(),
            "fullName", request.getFullName(),
            "email", request.getEmail()
        ));
    }
}