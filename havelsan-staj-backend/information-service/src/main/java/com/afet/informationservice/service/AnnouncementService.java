package com.afet.informationservice.service;

import com.afet.informationservice.dto.CreateAnnouncementDto;
import com.afet.informationservice.dto.NotificationEvent;
import com.afet.informationservice.entity.Announcement;
import com.afet.informationservice.producer.NotificationProducer;
import com.afet.informationservice.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.swing.*;

@Service
@RequiredArgsConstructor // Constructor injection için Lombok anotasyonu
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final NotificationProducer notificationProducer;

    public void create(CreateAnnouncementDto dto, Integer adminId) {
        Announcement announcement = Announcement.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .adminId(adminId)
                .build();

        announcementRepository.save(announcement);

        NotificationEvent event = new NotificationEvent(
                0,
                "Yeni Duyuru: " + announcement.getTitle(),
                "Yetkililer tarafından yeni bir duyuru yayınlandı. Lütfen kontrol ediniz."
        );
        notificationProducer.sendNotificationEvent(event);
    }
}