package com.afet.requestservice.entity;

import com.afet.requestservice.dto.Enum.RequestStatus;
import com.afet.requestservice.dto.Enum.RequestType;
import com.afet.requestservice.dto.Enum.Urgency;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import org.locationtech.jts.geom.Point;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "help_requests")
public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private Integer requesterId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestType requestType;

    private String details;

    @Column(columnDefinition = "geography(Point,4326)")
    private Point location;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.BEKLEMEDE;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Urgency urgency = Urgency.ORTA;

    @CreationTimestamp
    private LocalDateTime createdAt;
}