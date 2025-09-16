package com.afet.notificationservice.service;

import com.afet.notificationservice.dto.NotificationPreferences;
import com.afet.notificationservice.dto.NotificationHistory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final ConcurrentHashMap<Integer, NotificationPreferences> userPreferences = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Integer, List<NotificationHistory>> notificationHistory = new ConcurrentHashMap<>();

    public NotificationPreferences getUserPreferences(Integer userId) {
        return userPreferences.computeIfAbsent(userId, id -> NotificationPreferences.builder()
                .userId(id)
                .pushEnabled(true)
                .emailEnabled(true)
                .smsEnabled(false)
                .emergencyAlertsEnabled(true)
                .assignmentUpdatesEnabled(true)
                .systemAnnouncementsEnabled(true)
                .build());
    }

    public NotificationPreferences updateUserPreferences(NotificationPreferences preferences) {
        userPreferences.put(preferences.getUserId(), preferences);
        log.info("Updated notification preferences for user: {}", preferences.getUserId());
        return preferences;
    }

    public List<NotificationHistory> getUserNotificationHistory(Integer userId, int page, int size) {
        List<NotificationHistory> history = notificationHistory.getOrDefault(userId, new ArrayList<>());
        int start = page * size;
        int end = Math.min(start + size, history.size());
        
        if (start >= history.size()) {
            return new ArrayList<>();
        }
        
        return history.subList(start, end);
    }

    public void markNotificationAsRead(Integer notificationId) {
        log.info("Marked notification as read: {}", notificationId);
    }

    public void markAllNotificationsAsRead(Integer userId) {
        List<NotificationHistory> history = notificationHistory.getOrDefault(userId, new ArrayList<>());
        history.forEach(notification -> notification.setStatus("READ"));
        log.info("Marked all notifications as read for user: {}", userId);
    }

    public void clearNotificationHistory(Integer userId) {
        notificationHistory.remove(userId);
        log.info("Cleared notification history for user: {}", userId);
    }

    public void saveNotificationToHistory(NotificationHistory notification) {
        notificationHistory.computeIfAbsent(notification.getUserId(), k -> new ArrayList<>())
                .add(notification);
        log.info("Saved notification to history: {}", notification.getId());
    }
}
