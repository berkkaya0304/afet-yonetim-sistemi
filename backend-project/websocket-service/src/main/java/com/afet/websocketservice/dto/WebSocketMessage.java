package com.afet.websocketservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {
    private String type;
    private String message;
    private Object data;
    private Long timestamp;
    private Integer userId;
}
