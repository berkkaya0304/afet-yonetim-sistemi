package com.afet.apigatewayservice.config;

import com.afet.apigatewayservice.filter.AuthenticationFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    private final AuthenticationFilter filter;

    public GatewayConfig(AuthenticationFilter filter) {
        this.filter = filter;
    }

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service-route", r -> r.path("/api/v1/auth/**", "/api/v1/users/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())))
                        .uri("http://localhost:8081"))   // ✅ correct URI scheme

                .route("request-service-route", r -> r.path("/api/v1/help-requests/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())))
                        .uri("http://localhost:8082"))   // ✅ correct URI scheme

                .route("assignment-service-route", r -> r.path("/api/v1/assignments/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())))
                        .uri("http://localhost:8083"))

                .route("information-service-route", r -> r
                        .path("/api/v1/announcements/**", "/api/v1/admin/announcements/**", "/api/v1/safe-zones/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config()))) // Filtremiz admin yollarını koruyacak.
                        .uri("http://localhost:8084")) // Eureka'daki servis adını kullanıyoruz.
                .route("websocket-service-route", r -> r
                        .path("/ws/**", "/topic/**")
                        .uri("http://localhost:8086"))  // websocket / STOMP servisi port

                .build();
    }
}