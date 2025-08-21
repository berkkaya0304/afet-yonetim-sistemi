package com.afet.assignmentservice.dto;

import com.afet.assignmentservice.entity.AssignmentStatus;
import lombok.Data;

@Data
public class UpdateAssignmentStatusDto {
    AssignmentStatus status;
}
