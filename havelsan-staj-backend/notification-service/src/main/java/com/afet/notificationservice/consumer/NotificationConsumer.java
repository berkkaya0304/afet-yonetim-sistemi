package com.afet.notificationservice.consumer;

import com.afet.notificationservice.dto.NotificationEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationConsumer {

    @RabbitListener(queues = {"${app.rabbitmq.queues.notification}"})
    public void consumeNotificationEvent(NotificationEvent event) {
        log.info("Received notification event -> {}", event);

        // BURADA GERÇEK BİLDİRİM GÖNDERME MANTIĞI OLACAK
        // 1. Kullanıcının bildirim tercihlerini (push, email, sms) veritabanından al.
        // 2. Firebase Cloud Messaging, SendGrid (email) veya Twilio (SMS) gibi servislerin API'larını çağır.

        System.out.println("-------------------------------------------");
        System.out.printf("KULLANICI ID %d İÇİN BİLDİRİM GÖNDERİLİYOR:%n", event.getUserId());
        System.out.printf("Başlık: %s%n", event.getTitle());
        System.out.printf("Mesaj: %s%n", event.getMessage());
        System.out.println("-------------------------------------------");
    }
}