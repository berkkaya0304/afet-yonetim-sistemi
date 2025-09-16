package com.afet.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationHistory {
    private Integer id;
    private Integer userId;
    private String title;
    private String message;
    private String type;
    private String status; // "SENT", "READ", "FAILED"
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private String channel; // "PUSH", "EMAIL", "SMS", "WEBSOCKET"
}
