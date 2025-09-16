package com.afet.notificationservice.consumer;

import com.afet.notificationservice.dto.NotificationEvent;
import com.afet.notificationservice.dto.NotificationHistory;
import com.afet.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = {"${app.rabbitmq.queues.notification}"})
    public void consumeNotificationEvent(NotificationEvent event) {
        log.info("Received notification event -> {}", event);

        NotificationHistory history = NotificationHistory.builder()
                .id((int) System.currentTimeMillis()) // Basit ID generation
                .userId(event.getUserId())
                .title(event.getTitle())
                .message(event.getMessage())
                .type("SYSTEM")
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .channel("WEBSOCKET")
                .build();

        notificationService.saveNotificationToHistory(history);

        var preferences = notificationService.getUserPreferences(event.getUserId());

        if (preferences.getPushEnabled()) {
            sendPushNotification(event);
        }

        if (preferences.getEmailEnabled()) {
            sendEmailNotification(event);
        }

        if (preferences.getSmsEnabled()) {
            sendSmsNotification(event);
        }

        log.info("Processed notification for user: {}", event.getUserId());
    }

    private void sendPushNotification(NotificationEvent event) {
        // TODO: Firebase Cloud Messaging implementasyonu
        log.info("Sending push notification to user: {}", event.getUserId());
    }

    private void sendEmailNotification(NotificationEvent event) {
        // TODO: SendGrid veya başka email service implementasyonu
        log.info("Sending email notification to user: {}", event.getUserId());
    }

    private void sendSmsNotification(NotificationEvent event) {
        // TODO: Twilio veya başka SMS service implementasyonu
        log.info("Sending SMS notification to user: {}", event.getUserId());
    }
}