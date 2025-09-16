package com.afet.apigatewayservice.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/api/v1/auth/**",
            "/api/v1/users/me"
    );

    public static final List<String> authenticatedEndpoints = List.of(
         // All authenticated users can access skills
    );

    public static final List<String> adminApiEndpoints = List.of(
            "/api/v1/admin/**"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().startsWith(uri));

    public Predicate<ServerHttpRequest> isAdminRoute =
            request -> adminApiEndpoints.stream()
                    .anyMatch(uri -> request.getURI().getPath().startsWith(uri));
}