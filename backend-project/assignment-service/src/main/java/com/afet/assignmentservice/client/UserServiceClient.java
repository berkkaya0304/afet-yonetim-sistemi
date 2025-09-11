package com.afet.assignmentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @PostMapping("/api/v1/internal/users/{userId}/task-completed")
    void notifyTaskCompletion(@PathVariable("userId") Integer userId);
}