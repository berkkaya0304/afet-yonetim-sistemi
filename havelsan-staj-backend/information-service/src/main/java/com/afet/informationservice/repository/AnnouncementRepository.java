package com.afet.informationservice.repository;

import com.afet.informationservice.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Announcement entity'si için veritabanı işlemlerini yürüten Spring Data JPA repository'si.
 */
@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Integer> {
}