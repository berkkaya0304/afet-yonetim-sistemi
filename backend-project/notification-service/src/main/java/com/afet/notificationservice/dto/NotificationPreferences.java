package com.afet.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferences {
    private Integer userId;
    private Boolean pushEnabled;
    private Boolean emailEnabled;
    private Boolean smsEnabled;
    private Boolean emergencyAlertsEnabled;
    private Boolean assignmentUpdatesEnabled;
    private Boolean systemAnnouncementsEnabled;
}
