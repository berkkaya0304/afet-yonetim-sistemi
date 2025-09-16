package com.afet.assignmentservice.client;

import com.afet.assignmentservice.client.dto.UpdateStatusDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "request-service")
public interface RequestServiceClient {

    // request-service'te oluşturacağımız endpoint'in imzasını buraya kopyalıyoruz.
    @PutMapping("/api/v1/help-requests/{id}/status")
    void updateRequestStatus(@PathVariable("id") Integer id, @RequestBody UpdateStatusDto statusDto);

    @GetMapping("/api/v1/internal/statistics/help-requests")
    Long getTotalHelpRequests();
}