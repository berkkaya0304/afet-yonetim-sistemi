package com.afet.assignmentservice.service;

import com.afet.assignmentservice.client.RequestServiceClient;
import com.afet.assignmentservice.client.dto.UpdateStatusDto;
import com.afet.assignmentservice.dto.CreateAssignmentDto;
import com.afet.assignmentservice.entity.Assignment;
import com.afet.assignmentservice.entity.AssignmentStatus;
import com.afet.assignmentservice.repository.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.afet.assignmentservice.client.UserServiceClient; // Yeni import


@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final RequestServiceClient requestServiceClient;
    private final UserServiceClient userServiceClient;

    @Transactional // Bu operasyon ya tamamen başarılı olmalı ya da hiç olmamalı
    public void createAssignment(CreateAssignmentDto dto, Integer volunteerId) {
        // 1. Yeni bir görev oluştur ve veritabanına kaydet
        Assignment assignment = Assignment.builder()
                .requestId(dto.getRequestId())
                .volunteerId(volunteerId)
                .status(AssignmentStatus.ATANMIS)
                .build();
        assignmentRepository.save(assignment);

        // 2. Feign Client aracılığıyla request-service'e haber ver
        // İlgili yardım talebinin durumunu "ATANMIS" olarak güncelle
        requestServiceClient.updateRequestStatus(dto.getRequestId(), new UpdateStatusDto("ATANMIS"));
    }

    @Transactional
    public void updateAssignmentStatus(Integer assignmentId, AssignmentStatus newStatus) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignment.setStatus(newStatus);

        if (newStatus == AssignmentStatus.TAMAMLANDI) {
            assignment.setCompletedAt(java.time.LocalDateTime.now());

            // 1. Görevi veritabanında güncelle
            assignmentRepository.save(assignment);

            // 2. request-service'e haber ver (opsiyonel ama iyi bir pratik)
            requestServiceClient.updateRequestStatus(assignment.getRequestId(), new UpdateStatusDto("TAMAMLANDI"));

            // 3. user-service'e rozet kontrolü için haber ver
            userServiceClient.notifyTaskCompletion(assignment.getVolunteerId());

        } else {
            assignmentRepository.save(assignment);
        }
    }
}