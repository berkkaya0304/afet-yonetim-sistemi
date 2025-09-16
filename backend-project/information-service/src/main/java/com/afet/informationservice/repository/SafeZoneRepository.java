package com.afet.informationservice.repository;

import com.afet.informationservice.entity.SafeZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SafeZoneRepository extends JpaRepository<SafeZone, Integer> {
    
    /**
     * Find all active safe zones
     */
    List<SafeZone> findByIsActiveTrue();
    
    /**
     * Find safe zones by name containing (case-insensitive)
     */
    List<SafeZone> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find safe zones by address containing (case-insensitive)
     */
    List<SafeZone> findByAddressContainingIgnoreCase(String address);
    
    /**
     * Find safe zones with capacity greater than or equal to specified value
     */
    List<SafeZone> findByCapacityGreaterThanEqualAndIsActiveTrue(Integer capacity);
    
    /**
     * Find safe zones within a bounding box (approximate)
     */
    @Query("SELECT sz FROM SafeZone sz WHERE sz.isActive = true " +
           "AND sz.latitude BETWEEN :minLat AND :maxLat " +
           "AND sz.longitude BETWEEN :minLon AND :maxLon")
    List<SafeZone> findSafeZonesInBoundingBox(
            @Param("minLat") Double minLat,
            @Param("maxLat") Double maxLat,
            @Param("minLon") Double minLon,
            @Param("maxLon") Double maxLon);
    
    /**
     * Find safe zones by facilities containing specific text
     */
    List<SafeZone> findByFacilitiesContainingIgnoreCaseAndIsActiveTrue(String facilities);
    
    /**
     * Count active safe zones
     */
    long countByIsActiveTrue();
    
    /**
     * Find safe zones created after a specific date
     */
    List<SafeZone> findByCreatedAtAfterAndIsActiveTrue(java.time.LocalDateTime date);
}
