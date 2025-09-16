package com.afet.notificationservice.controller;

import com.afet.notificationservice.dto.NotificationPreferences;
import com.afet.notificationservice.dto.NotificationHistory;
import com.afet.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/preferences/{userId}")
    public ResponseEntity<NotificationPreferences> getUserPreferences(@PathVariable Integer userId) {
        NotificationPreferences preferences = notificationService.getUserPreferences(userId);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences/{userId}")
    public ResponseEntity<NotificationPreferences> updateUserPreferences(
            @PathVariable Integer userId,
            @RequestBody NotificationPreferences preferences) {
        preferences.setUserId(userId);
        NotificationPreferences updated = notificationService.updateUserPreferences(preferences);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<NotificationHistory>> getUserNotificationHistory(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<NotificationHistory> history = notificationService.getUserNotificationHistory(userId, page, size);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/mark-read/{notificationId}")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Integer notificationId) {
        notificationService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mark-all-read/{userId}")
    public ResponseEntity<Void> markAllNotificationsAsRead(@PathVariable Integer userId) {
        notificationService.markAllNotificationsAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/history/{userId}")
    public ResponseEntity<Void> clearNotificationHistory(@PathVariable Integer userId) {
        notificationService.clearNotificationHistory(userId);
        return ResponseEntity.ok().build();
    }
}
