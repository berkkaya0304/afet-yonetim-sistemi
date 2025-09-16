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
            if (validator.isSecured.test(exchange.getRequest())) {
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return onError(exchange, HttpStatus.UNAUTHORIZED, "Authorization header is missing");
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }

                try {
                    if (jwtUtil.isInvalid(authHeader)) {
                        return onError(exchange, HttpStatus.UNAUTHORIZED, "Invalid or expired token");
                    }

                    var claims = jwtUtil.getAllClaimsFromToken(authHeader);

                    if (validator.isAdminRoute.test(exchange.getRequest())) {
                        List<String> roles = (List<String>) claims.get("roles");
                        if (roles == null || !roles.contains("ROLE_YONETICI")) {
                            return onError(exchange, HttpStatus.FORBIDDEN, "Admin role required for this endpoint");
                        }
                    }
                    

                    exchange.getRequest().mutate()
                            .header("X-User-Id", claims.get("userId") != null ? claims.get("userId").toString() : claims.getSubject())
                            .header("X-User-Roles", claims.get("roles") != null ? claims.get("roles").toString() : "")
                            .build();

                } catch (Exception e) {
                    return onError(exchange, HttpStatus.UNAUTHORIZED, "Token validation failed: " + e.getMessage());
                }
            }
            return chain.filter(exchange);
        });
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus httpStatus, String message) {
        exchange.getResponse().setStatusCode(httpStatus);
        exchange.getResponse().getHeaders().add("Content-Type", "application/json");
        String errorBody = "{\"error\":\"" + httpStatus.getReasonPhrase() + "\",\"message\":\"" + message + "\"}";
        return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(errorBody.getBytes())));
    }

    public static class Config {
    }
}