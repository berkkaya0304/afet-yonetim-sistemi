package com.afet.websocketservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "WebSocket Service is running!";
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
