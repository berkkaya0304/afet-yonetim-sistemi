package com.afet.requestservice.repository;

import com.afet.requestservice.entity.HelpRequest;
import com.afet.requestservice.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HelpRequestRepository extends JpaRepository<HelpRequest, Integer> {
    // Belirli bir kullanıcının taleplerini bulmak için
    List<HelpRequest> findByRequesterId(Integer requesterId);

    // Duruma göre talepleri filtrelemek için
    List<HelpRequest> findByStatus(RequestStatus status);

    @Query(value = "SELECT * FROM help_requests hr " +
            "WHERE ST_DWithin(hr.location, ST_MakePoint(:lon, :lat)::geography, :radius)",
            nativeQuery = true)
    List<HelpRequest> findRequestsWithinRadius(
            @Param("lat") double lat,
            @Param("lon") double lon,
            @Param("radius") int radius // Metre cinsinden yarıçap
    );
}