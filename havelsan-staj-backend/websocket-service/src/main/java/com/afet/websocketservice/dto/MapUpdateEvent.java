package com.afet.websocketservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MapUpdateEvent {
    private EventType eventType; // CREATED, UPDATED, DELETED
    private String entityType;    // HELP_REQUEST, SAFE_ZONE etc.
    private Object payload;       // Güncellenen nesnenin kendisi (örn: HelpRequestDto)

    public enum EventType {
        CREATED, UPDATED, DELETED
    }
}