package com.afet.websocketservice.controller;

import com.afet.websocketservice.dto.MapUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/websocket")
@RequiredArgsConstructor
@Slf4j
public class WebSocketTestController {

    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/test-message")
    public String sendTestMessage(@RequestBody MapUpdateEvent event) {
        log.info("Sending test message: {}", event);
        
        // Test mesajını WebSocket topic'ine gönder
        messagingTemplate.convertAndSend("/topic/map-updates", event);
        
        return "Test message sent successfully!";
    }

    @PostMapping("/broadcast")
    public String broadcastMessage(@RequestBody String message) {
        log.info("Broadcasting message: {}", message);
        
        // Basit bir string mesajı gönder
        messagingTemplate.convertAndSend("/topic/map-updates", message);
        
        return "Message broadcasted successfully!";
    }
}
