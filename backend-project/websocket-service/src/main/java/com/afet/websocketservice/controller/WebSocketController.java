package com.afet.websocketservice.controller;

import com.afet.websocketservice.dto.MapUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/map-update")
    @SendTo("/topic/map-updates")
    public MapUpdateEvent handleMapUpdate(MapUpdateEvent event) {
        log.info("Received map update from client: {}", event);
        return event;
    }

    @MessageMapping("/user-location")
    public void handleUserLocation(MapUpdateEvent event) {
        log.info("Received user location update: {}", event);
        messagingTemplate.convertAndSend("/topic/user-locations", event);
    }

    @MessageMapping("/emergency-alert")
    public void handleEmergencyAlert(MapUpdateEvent event) {
        log.info("Received emergency alert: {}", event);
        messagingTemplate.convertAndSend("/topic/emergency-alerts", event);
    }
}
