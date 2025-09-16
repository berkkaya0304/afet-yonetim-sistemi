package com.afet.assignmentservice.dto;

import com.afet.assignmentservice.dto.Enum.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAssignmentStatusDto {
    private AssignmentStatus status;

    // Explicit getter in case Lombok is not working
    public AssignmentStatus getStatus() {
        return status;
    }

    public void setStatus(AssignmentStatus status) {
        this.status = status;
    }
}
