package com.afet.requestservice.controller;

import com.afet.requestservice.service.HelpRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/statistics")
@RequiredArgsConstructor
public class InternalController {

    private final HelpRequestService helpRequestService;

    @GetMapping("/help-requests")
    public ResponseEntity<Long> getTotalHelpRequests() {
        Long totalCount = helpRequestService.getTotalHelpRequestsCount();
        return ResponseEntity.ok(totalCount);
    }
}
