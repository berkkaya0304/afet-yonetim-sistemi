package com.afet.assignmentservice.controller;

import com.afet.assignmentservice.dto.CreateAssignmentDto;
import com.afet.assignmentservice.entity.AssignmentStatus;
import com.afet.assignmentservice.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.afet.assignmentservice.dto.UpdateAssignmentStatusDto; // Yeni DTO

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;


    @PostMapping
    public ResponseEntity<Void> createAssignment(
            @RequestBody CreateAssignmentDto dto,
            @RequestHeader("X-User-Id") Integer volunteerId) {
        assignmentService.createAssignment(dto, volunteerId);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Integer id,
            @RequestBody UpdateAssignmentStatusDto dto,
            @RequestHeader("X-User-Id") Integer volunteerId) {

        // TODO: Güvenlik kontrolü: Bu görevi güncelleyen kişi, görevin sahibi mi?

        assignmentService.updateAssignmentStatus(id, dto.getStatus());
        return ResponseEntity.ok().build();
    }
}