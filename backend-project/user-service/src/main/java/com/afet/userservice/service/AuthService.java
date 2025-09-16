package com.afet.userservice.service;

import com.afet.userservice.dto.AuthResponse;
import com.afet.userservice.dto.LoginRequest;
import com.afet.userservice.dto.RegisterRequest;
import com.afet.userservice.dto.Enum.Role;
import com.afet.userservice.entity.User;
import com.afet.userservice.repository.UserRepository;
import com.afet.userservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        System.out.println("DEBUG: AuthService.register called");
        System.out.println("DEBUG: Request role = " + request.getRole());
        System.out.println("DEBUG: Request role type = " + (request.getRole() != null ? request.getRole().getClass().getName() : "null"));
        
        // Role string'ini enum'a çevir
        Role userRole = Role.VATANDAS; // Varsayılan rol
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            try {
                userRole = Role.valueOf(request.getRole().toUpperCase());
                System.out.println("DEBUG: Successfully converted role to: " + userRole);
            } catch (IllegalArgumentException e) {
                // Geçersiz rol verilirse varsayılan rolü kullan
                System.out.println("DEBUG: Failed to convert role, using default: " + e.getMessage());
                userRole = Role.VATANDAS;
            }
        } else {
            System.out.println("DEBUG: Role is null or empty, using default: VATANDAS");
        }
        
        var user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .build();
        
        System.out.println("DEBUG: User built with role: " + user.getRole());
        User savedUser = userRepository.save(user);
        System.out.println("DEBUG: User saved with role: " + savedUser.getRole());

        var jwtToken = jwtService.generateToken(savedUser);
        return AuthResponse.builder().token(jwtToken).build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        // Eğer yukarıdaki satır hata vermezse, kullanıcı doğrudur.
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder().token(jwtToken).build();
    }
}