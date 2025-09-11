package com.afet.informationservice.producer;

import com.afet.informationservice.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProducer {

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-keys.notification}")
    private String notificationRoutingKey;

    private final RabbitTemplate rabbitTemplate;

    public void sendNotificationEvent(NotificationEvent event) {
        log.info("Sending notification event -> {}", event);
        rabbitTemplate.convertAndSend(exchange, notificationRoutingKey, event);
    }
}