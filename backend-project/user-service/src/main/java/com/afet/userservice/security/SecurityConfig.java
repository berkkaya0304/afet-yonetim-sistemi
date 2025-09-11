package com.afet.userservice.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // CSRF'i devre dışı bırak (stateless API için yaygın)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**","/swagger-ui.html","/swagger-ui/**","/v3/api-docs/**").permitAll() // /auth/** endpoint'lerine izin ver
                        .anyRequest().authenticated() // Diğer tüm istekler kimlik doğrulaması gerektirir
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Session kullanma
                .authenticationProvider(authenticationProvider) // Kendi auth provider'ımızı tanıt
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class); // Filtremizi ekle

        return http.build();
    }
}