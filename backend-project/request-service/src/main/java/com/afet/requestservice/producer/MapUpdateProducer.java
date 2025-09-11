package com.afet.requestservice.producer;

import com.afet.requestservice.dto.MapUpdateEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
@RequiredArgsConstructor
public class MapUpdateProducer {

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-keys.map-update}")
    private String mapUpdateRoutingKey;

    private final RabbitTemplate rabbitTemplate;

    public void sendMapUpdateEvent(MapUpdateEvent event) {
        rabbitTemplate.convertAndSend(exchange, mapUpdateRoutingKey, event);
    }
}