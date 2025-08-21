package com.afet.requestservice.service;

import com.afet.requestservice.dto.CreateHelpRequestDto;
import com.afet.requestservice.dto.HelpRequestDto;
import com.afet.requestservice.dto.MapUpdateEvent;
import com.afet.requestservice.entity.HelpRequest;
import com.afet.requestservice.entity.RequestStatus;
import com.afet.requestservice.producer.MapUpdateProducer;
import com.afet.requestservice.repository.HelpRequestRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HelpRequestService {

    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
    private final MapUpdateProducer mapUpdateProducer; // Inject et
    private final HelpRequestRepository repository;

    public HelpRequestDto createHelpRequest(CreateHelpRequestDto dto, Integer requesterId) {

        Point locationPoint = geometryFactory.createPoint(new Coordinate(dto.getLongitude(), dto.getLatitude()));
        HelpRequest helpRequest = HelpRequest.builder()
                .requesterId(requesterId) // Bu bilgi JWT'den gelecek
                .requestType(dto.getRequestType())
                .details(dto.getDetails())
                .location(locationPoint) // Point nesnesini set et
                .urgency(dto.getUrgency())
                .build();

        HelpRequest savedRequest = repository.save(helpRequest);
        return mapToDto(savedRequest);
    }

    public List<HelpRequestDto> getRequestsForUser(Integer requesterId) {
        return repository.findByRequesterId(requesterId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void updateStatus(Integer requestId, String newStatus) {
        HelpRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RequestStatus.valueOf(newStatus.toUpperCase()));
        repository.save(request);
    }

    public List<HelpRequestDto> getAllRequests() {
        return repository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<HelpRequestDto> findNearbyRequests(double lat, double lon, int radius) {
        return repository.findRequestsWithinRadius(lat, lon, radius).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private HelpRequestDto mapToDto(HelpRequest request) {
        return HelpRequestDto.builder()
                .id(request.getId())
                .requesterId(request.getRequesterId())
                .requestType(request.getRequestType().name())
                .details(request.getDetails())
                .latitude(request.getLocation().getY())
                .longitude(request.getLocation().getX())
                .status(request.getStatus().name())
                .urgency(request.getUrgency().name())
                .createdAt(request.getCreatedAt())
                .build();
    }

    public void updateStatusByAdmin(Integer requestId, String newStatus) {
        HelpRequest request = repository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RequestStatus.valueOf(newStatus.toUpperCase()));
        HelpRequest updatedRequest = repository.save(request);

        MapUpdateEvent event = new MapUpdateEvent(
                MapUpdateEvent.EventType.UPDATED,
                "HELP_REQUEST",
                mapToDto(updatedRequest) // Güncellenmiş DTO'yu payload olarak gönder
        );
        mapUpdateProducer.sendMapUpdateEvent(event);
    }



}