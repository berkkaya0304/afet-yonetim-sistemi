package com.afet.apigatewayservice.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> openApiEndpoints = List.of(
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/help-requests"
    );

    public static final List<String> adminApiEndpoints = List.of(
            "/api/v1/admin",
            "/api/v1/admin/**"
    );

    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));

    public Predicate<ServerHttpRequest> isAdminRoute =
            request -> adminApiEndpoints.stream()
                    .anyMatch(uri -> request.getURI().getPath().startsWith(uri));
}