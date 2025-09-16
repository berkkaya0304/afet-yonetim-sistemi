package com.afet.assignmentservice.client.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateStatusDto {
    private String status;

    // Explicit setter in case Lombok is not working
    public void setStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}