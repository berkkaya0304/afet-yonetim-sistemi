package com.afet.informationservice.repository;

import com.afet.informationservice.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Integer> {
    List<Location> findByType(String type);
}
