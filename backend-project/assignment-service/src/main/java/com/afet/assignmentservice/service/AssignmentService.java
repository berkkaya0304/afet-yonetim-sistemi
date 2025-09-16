package com.afet.assignmentservice.service;

import com.afet.assignmentservice.client.RequestServiceClient;
import com.afet.assignmentservice.client.dto.UpdateStatusDto;
import com.afet.assignmentservice.dto.AssignmentDto;
import com.afet.assignmentservice.dto.CreateAssignmentDto;
import com.afet.assignmentservice.dto.AdminStatisticsDto;
import com.afet.assignmentservice.entity.Assignment;
import com.afet.assignmentservice.dto.Enum.AssignmentStatus;
import com.afet.assignmentservice.repository.AssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.afet.assignmentservice.client.UserServiceClient; // Yeni import
import com.afet.assignmentservice.client.InformationServiceClient;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final RequestServiceClient requestServiceClient;
    private final UserServiceClient userServiceClient;
    private final InformationServiceClient informationServiceClient;
    
    public AssignmentService(AssignmentRepository assignmentRepository,
                           RequestServiceClient requestServiceClient,
                           UserServiceClient userServiceClient,
                           InformationServiceClient informationServiceClient) {
        this.assignmentRepository = assignmentRepository;
        this.requestServiceClient = requestServiceClient;
        this.userServiceClient = userServiceClient;
        this.informationServiceClient = informationServiceClient;
    }

    @Transactional
    public void createAssignment(CreateAssignmentDto dto, Integer volunteerId) {
        Assignment assignment = Assignment.builder()
                .requestId(dto.getRequestId())
                .volunteerId(volunteerId)
                .status(AssignmentStatus.ATANMIS)
                .build();
        assignmentRepository.save(assignment);

        UpdateStatusDto updateStatusDto = new UpdateStatusDto();
        updateStatusDto.setStatus("ATANMIS");
        requestServiceClient.updateRequestStatus(dto.getRequestId(), updateStatusDto);
    }

    @Transactional
    public void updateAssignmentStatus(Integer assignmentId, AssignmentStatus newStatus) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignment.setStatus(newStatus);

        if (newStatus == AssignmentStatus.TAMAMLANDI) {
            assignment.setCompletedAt(java.time.LocalDateTime.now());

            assignmentRepository.save(assignment);

            UpdateStatusDto updateStatusDto = new UpdateStatusDto();
            updateStatusDto.setStatus("TAMAMLANDI");
            requestServiceClient.updateRequestStatus(assignment.getRequestId(), updateStatusDto);

            userServiceClient.notifyTaskCompletion(assignment.getVolunteerId());

        } else {
            assignmentRepository.save(assignment);
        }
    }

    public List<AssignmentDto> getAllAssignments() {
        return assignmentRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AssignmentDto> getAssignmentsByVolunteerId(Integer volunteerId) {
        return assignmentRepository.findByVolunteerId(volunteerId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AssignmentDto> getAssignmentsByStatus(AssignmentStatus status) {
        return assignmentRepository.findByStatus(status)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AssignmentDto> getAvailableTasksForVolunteers() {
        return assignmentRepository.findByStatus(AssignmentStatus.ATANMIS)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public AdminStatisticsDto getAdminStatistics() {
        try {
            Long totalHelpRequests = requestServiceClient.getTotalHelpRequests();
            
            Long activeVolunteers = userServiceClient.getActiveVolunteers();
            
            Long completedTasks = assignmentRepository.countByStatus(AssignmentStatus.TAMAMLANDI);
            
            Long safeZones = informationServiceClient.getSafeZonesCount();
            
            return AdminStatisticsDto.builder()
                    .totalHelpRequests(totalHelpRequests != null ? totalHelpRequests : 0L)
                    .activeVolunteers(activeVolunteers != null ? activeVolunteers : 0L)
                    .completedTasks(completedTasks != null ? completedTasks : 0L)
                    .safeZones(safeZones != null ? safeZones : 0L)
                    .build();
        } catch (Exception e) {
            return AdminStatisticsDto.builder()
                    .totalHelpRequests(0L)
                    .activeVolunteers(0L)
                    .completedTasks(0L)
                    .safeZones(0L)
                    .build();
        }
    }

    private AssignmentDto convertToDto(Assignment assignment) {
        return AssignmentDto.builder()
                .id(assignment.getId())
                .requestId(assignment.getRequestId())
                .volunteerId(assignment.getVolunteerId())
                .status(assignment.getStatus())
                .assignedAt(assignment.getAssignedAt())
                .completedAt(assignment.getCompletedAt())
                .build();
    }
}