package com.afet.informationservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Veritabanındaki 'announcements' tablosunu temsil eden JPA entity'si.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "announcements")
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer adminId; // Duyuruyu oluşturan yöneticinin ID'si.
    // Not: Bu servis User entity'sini bilmez, sadece ID'sini tutar.

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp // Bu entity ilk kaydedildiğinde otomatik olarak o anın zamanını atar.
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

}