package com.afet.informationservice.service;

import com.afet.informationservice.dto.SafeZoneDto;
import com.afet.informationservice.dto.CreateSafeZoneDto;
import com.afet.informationservice.dto.UpdateSafeZoneDto;
import com.afet.informationservice.entity.SafeZone;
import com.afet.informationservice.repository.SafeZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SafeZoneService {

    private final SafeZoneRepository safeZoneRepository;

    public List<SafeZoneDto> getAllSafeZones() {
        return safeZoneRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<SafeZoneDto> getActiveSafeZones() {
        return safeZoneRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }


    public SafeZoneDto getSafeZoneById(Integer id) {
        SafeZone safeZone = safeZoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Safe zone not found with id: " + id));
        return mapToDto(safeZone);
    }

    public SafeZoneDto createSafeZone(CreateSafeZoneDto createSafeZoneDto) {
        SafeZone safeZone = SafeZone.builder()
                .name(createSafeZoneDto.getName())
                .description(createSafeZoneDto.getDescription())
                .latitude(createSafeZoneDto.getLatitude())
                .longitude(createSafeZoneDto.getLongitude())
                .address(createSafeZoneDto.getAddress())
                .capacity(createSafeZoneDto.getCapacity())
                .facilities(createSafeZoneDto.getFacilities())
                .isActive(true)
                .build();

        SafeZone savedSafeZone = safeZoneRepository.save(safeZone);
        return mapToDto(savedSafeZone);
    }

    public SafeZoneDto updateSafeZone(Integer id, UpdateSafeZoneDto updateSafeZoneDto) {
        SafeZone existingSafeZone = safeZoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Safe zone not found with id: " + id));

        if (updateSafeZoneDto.getName() != null) {
            existingSafeZone.setName(updateSafeZoneDto.getName());
        }
        if (updateSafeZoneDto.getDescription() != null) {
            existingSafeZone.setDescription(updateSafeZoneDto.getDescription());
        }
        if (updateSafeZoneDto.getLatitude() != null) {
            existingSafeZone.setLatitude(updateSafeZoneDto.getLatitude());
        }
        if (updateSafeZoneDto.getLongitude() != null) {
            existingSafeZone.setLongitude(updateSafeZoneDto.getLongitude());
        }
        if (updateSafeZoneDto.getAddress() != null) {
            existingSafeZone.setAddress(updateSafeZoneDto.getAddress());
        }
        if (updateSafeZoneDto.getCapacity() != null) {
            existingSafeZone.setCapacity(updateSafeZoneDto.getCapacity());
        }
        if (updateSafeZoneDto.getFacilities() != null) {
            existingSafeZone.setFacilities(updateSafeZoneDto.getFacilities());
        }
        if (updateSafeZoneDto.getIsActive() != null) {
            existingSafeZone.setIsActive(updateSafeZoneDto.getIsActive());
        }

        SafeZone updatedSafeZone = safeZoneRepository.save(existingSafeZone);
        return mapToDto(updatedSafeZone);
    }

    public void deleteSafeZone(Integer id) {
        SafeZone safeZone = safeZoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Safe zone not found with id: " + id));
        
        safeZone.setIsActive(false);
        safeZoneRepository.save(safeZone);
    }

    public void hardDeleteSafeZone(Integer id) {
        if (!safeZoneRepository.existsById(id)) {
            throw new RuntimeException("Safe zone not found with id: " + id);
        }
        safeZoneRepository.deleteById(id);
    }

    public SafeZoneDto activateSafeZone(Integer id) {
        SafeZone safeZone = safeZoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Safe zone not found with id: " + id));
        
        safeZone.setIsActive(true);
        SafeZone activatedSafeZone = safeZoneRepository.save(safeZone);
        return mapToDto(activatedSafeZone);
    }

    public SafeZoneDto deactivateSafeZone(Integer id) {
        SafeZone safeZone = safeZoneRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Safe zone not found with id: " + id));
        
        safeZone.setIsActive(false);
        SafeZone deactivatedSafeZone = safeZoneRepository.save(safeZone);
        return mapToDto(deactivatedSafeZone);
    }

    public List<SafeZoneDto> searchSafeZonesByName(String name) {
        return safeZoneRepository.findAll()
                .stream()
                .filter(safeZone -> safeZone.getName().toLowerCase().contains(name.toLowerCase()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<SafeZoneDto> getSafeZonesNearLocation(Double latitude, Double longitude, Double radiusKm) {
        return safeZoneRepository.findByIsActiveTrue()
                .stream()
                .filter(safeZone -> calculateDistance(latitude, longitude, 
                        safeZone.getLatitude(), safeZone.getLongitude()) <= radiusKm)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth's radius in kilometers

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }


    public Long getSafeZonesCount() {
        return safeZoneRepository.count();
    }


    private SafeZoneDto mapToDto(SafeZone safeZone) {
        return SafeZoneDto.builder()
                .id(safeZone.getId())
                .name(safeZone.getName())
                .description(safeZone.getDescription())
                .latitude(safeZone.getLatitude())
                .longitude(safeZone.getLongitude())
                .address(safeZone.getAddress())
                .capacity(safeZone.getCapacity())
                .facilities(safeZone.getFacilities())
                .isActive(safeZone.getIsActive())
                .createdAt(safeZone.getCreatedAt())
                .build();
    }
}
