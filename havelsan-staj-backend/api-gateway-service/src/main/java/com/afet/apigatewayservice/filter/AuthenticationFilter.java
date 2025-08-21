package com.afet.apigatewayservice.filter;

import com.afet.apigatewayservice.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;


@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            // Eğer istek, kimlik doğrulaması gerektirmeyen (public) bir URL'e ise, direkt devam et
            if (validator.isSecured.test(exchange.getRequest())) {
                // Request header'ında token var mı diye kontrol et
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return onError(exchange, HttpStatus.UNAUTHORIZED);
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }

                try {
                    // Token'ı doğrula
                    if (jwtUtil.isInvalid(authHeader)) {
                        return onError(exchange, HttpStatus.UNAUTHORIZED);
                    }

                    // Token'dan claim'leri (kullanıcı id, rol vb.) çıkar
                    var claims = jwtUtil.getAllClaimsFromToken(authHeader);

                    // YENİ: Admin Rol Kontrolü
                    if (validator.isAdminRoute.test(exchange.getRequest())) {
                        List<String> roles = (List<String>) claims.get("roles");
                        if (roles == null || !roles.contains("YONETICI")) {
                            return onError(exchange, HttpStatus.FORBIDDEN); // Yetkin yok!
                        }
                    }

                    // İsteği downstream servise göndermeden önce header'ları modifiye et
                    exchange.getRequest().mutate()
                            .header("X-User-Id", claims.getSubject()) // 'sub' genelde user id/email içerir
                            // .header("X-User-Roles", claims.get("roles").toString()) // JWT'ye rol eklediyseniz
                            .build();

                } catch (Exception e) {
                    return onError(exchange, HttpStatus.UNAUTHORIZED);
                }
            }
            return chain.filter(exchange);
        });
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
    }
}