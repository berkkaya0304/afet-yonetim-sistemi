package com.afet.websocketservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // WebSocket mesaj broker'ını aktive eder
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // İstemcilerin (frontend) dinleyeceği topic'lerin ön ekini tanımlar.
        // Mesajlar bu adrese yayınlanır. Örn: /topic/map-updates
        config.enableSimpleBroker("/topic");
        // İstemcilerden sunucuya gelen mesajların ön ekini tanımlar (bu projede kullanmayacağız).
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Frontend'in WebSocket bağlantısı kuracağı endpoint.
        // withSockJS() -> Tarayıcı WebSocket desteklemiyorsa alternatifler sunar.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}