package com.afet.websocketservice.consumer;

import com.afet.websocketservice.dto.MapUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Bean;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class MapUpdateConsumer {

    // WebSocket topic'lerine mesaj göndermek için kullanılan yardımcı sınıf.
    private final SimpMessagingTemplate messagingTemplate;

    @Bean
    public Queue mapUpdateQueue() {
        return new Queue("map_update_queue", true); // durable = true
    }

    @RabbitListener(queues = {"${app.rabbitmq.queues.map-update}"})
    public void consumeMapUpdateEvent(MapUpdateEvent event) {
        log.info("Received map update event -> {}", event);

        // Gelen olayı /topic/map-updates adresine abone olan tüm istemcilere gönder.
        messagingTemplate.convertAndSend("/topic/map-updates", event);
        log.info("Broadcasted map update event to WebSocket topic.");
    }
}