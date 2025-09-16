package com.afet.informationservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "disaster_types")
public class DisasterType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String description;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String category; // NATURAL, MAN_MADE
}
