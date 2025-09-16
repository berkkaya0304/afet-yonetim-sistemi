package com.afet.userservice.dto;

import jakarta.persistence.*;
import lombok.Data;
import org.jetbrains.annotations.NotNull;

@Data
public class ManualBadgeAwardDto {
    @NotNull
    private Integer userId;
    
    @NotNull
    private Integer badgeId;
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public Integer getBadgeId() {
        return badgeId;
    }
    
    public void setBadgeId(Integer badgeId) {
        this.badgeId = badgeId;
    }
}
