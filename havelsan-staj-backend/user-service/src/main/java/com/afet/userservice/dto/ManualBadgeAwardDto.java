package com.afet.userservice.dto;

import jakarta.persistence.*;
import lombok.Data;

@Data
public class ManualBadgeAwardDto {
    Integer userId;
    Integer badgeId;
}
