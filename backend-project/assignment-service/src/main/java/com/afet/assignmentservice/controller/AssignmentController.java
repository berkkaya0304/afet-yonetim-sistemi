package com.afet.assignmentservice.controller;

import com.afet.assignmentservice.dto.AssignmentDto;
import com.afet.assignmentservice.dto.CreateAssignmentDto;
import com.afet.assignmentservice.dto.Enum.AssignmentStatus;
import com.afet.assignmentservice.service.AssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.afet.assignmentservice.dto.UpdateAssignmentStatusDto; // Yeni DTO

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public ResponseEntity<List<AssignmentDto>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/my")
    public ResponseEntity<List<AssignmentDto>> getMyAssignments(
            @RequestHeader("X-User-Id") Integer volunteerId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByVolunteerId(volunteerId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsByStatus(
            @PathVariable AssignmentStatus status) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByStatus(status));
    }

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

        assignmentService.updateAssignmentStatus(id, dto.getStatus());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/volunteers/tasks/available")
    public ResponseEntity<List<AssignmentDto>> getAvailableTasksForVolunteers() {
        return ResponseEntity.ok(assignmentService.getAvailableTasksForVolunteers());
    }
}