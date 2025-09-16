package com.afet.assignmentservice.controller;

import com.afet.assignmentservice.dto.AdminStatisticsDto;
import com.afet.assignmentservice.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AssignmentService assignmentService;
    
    public AdminController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping("/statistics")
    public ResponseEntity<AdminStatisticsDto> getAdminStatistics() {
        AdminStatisticsDto statistics = assignmentService.getAdminStatistics();
        return ResponseEntity.ok(statistics);
    }
}
