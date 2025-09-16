package com.afet.informationservice.service;

import com.afet.informationservice.dto.LocationDto;
import com.afet.informationservice.entity.Location;
import com.afet.informationservice.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    public LocationDto createLocation(LocationDto locationDto) {
        Location location = Location.builder()
                .name(locationDto.getName())
                .description(locationDto.getDescription())
                .latitude(locationDto.getLatitude())
                .longitude(locationDto.getLongitude())
                .address(locationDto.getAddress())
                .type(locationDto.getType())
                .build();
        
        Location savedLocation = locationRepository.save(location);
        return mapToDto(savedLocation);
    }

    public LocationDto getLocationById(Integer id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        return mapToDto(location);
    }

    private LocationDto mapToDto(Location location) {
        return LocationDto.builder()
                .id(location.getId())
                .name(location.getName())
                .description(location.getDescription())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .address(location.getAddress())
                .type(location.getType())
                .createdAt(location.getCreatedAt())
                .build();
    }
}
