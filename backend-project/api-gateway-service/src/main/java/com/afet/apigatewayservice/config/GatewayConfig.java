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
                .route("auth-service-route", r -> r.path("/api/v1/auth/**")
                        .uri("lb://user-service"))

                .route("user-service-route", r -> r.path("/api/v1/users/**", "/api/v1/skills/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://user-service"))

                .route("user-me-route", r -> r.path("/api/v1/users/me")
                        .uri("lb://user-service"))

                .route("request-service-route", r -> r.path("/api/v1/help-requests/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://request-service"))

                .route("assignment-service-route", r -> r.path("/api/v1/assignments/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://assignment-service"))

                .route("volunteer-tasks-route", r -> r.path("/api/v1/volunteers/tasks/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())).rewritePath("/api/v1/volunteers/tasks/(?<segment>.*)", "/api/v1/assignments/volunteers/tasks/${segment}"))
                        .uri("lb://assignment-service"))

                .route("information-service-route", r -> r
                        .path("/api/v1/announcements/**", "/api/v1/safezones/**", "/api/v1/locations/**", "/api/v1/disasters/**")
                        .uri("lb://information-service"))

                .route("admin-user-service-route", r -> r.path("/api/v1/admin/badges/**", "/api/v1/admin/volunteers/**", "/api/v1/admin/users/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://user-service"))

                .route("admin-assignment-service-route", r -> r.path("/api/v1/admin/statistics/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://assignment-service"))

                .route("admin-information-service-route", r -> r.path("/api/v1/admin/safezones/**", "/api/v1/admin/announcements/**", "/api/v1/admin/locations/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://information-service"))

                .route("websocket-service-route", r -> r
                        .path("/ws/**", "/topic/**")
                        .uri("lb://websocket-service"))

                .route("notification-service-route", r -> r.path("/api/v1/notifications/**")
                        .filters(f -> f.filter(filter.apply(new AuthenticationFilter.Config())))
                        .uri("lb://notification-service"))

                .build();
    }
}