package com.afet.requestservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MapUpdateEvent implements Serializable {

    private EventType eventType;

    private String entityType;


    private Object payload;

    public enum EventType {
        CREATED,
        UPDATED,
        DELETED
    }
}