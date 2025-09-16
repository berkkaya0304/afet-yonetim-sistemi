package com.afet.informationservice.repository;

import com.afet.informationservice.entity.DisasterType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisasterTypeRepository extends JpaRepository<DisasterType, Integer> {
}
