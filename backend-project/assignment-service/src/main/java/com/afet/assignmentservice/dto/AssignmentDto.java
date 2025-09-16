package com.afet.assignmentservice.dto;

import com.afet.assignmentservice.dto.Enum.AssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDto {
    private Integer id;
    private Integer requestId;
    private Integer volunteerId;
    private AssignmentStatus status;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;

    // Explicit builder in case Lombok is not working
    public static AssignmentDtoBuilder builder() {
        return new AssignmentDtoBuilder();
    }

    public static class AssignmentDtoBuilder {
        private Integer id;
        private Integer requestId;
        private Integer volunteerId;
        private AssignmentStatus status;
        private LocalDateTime assignedAt;
        private LocalDateTime completedAt;

        public AssignmentDtoBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public AssignmentDtoBuilder requestId(Integer requestId) {
            this.requestId = requestId;
            return this;
        }

        public AssignmentDtoBuilder volunteerId(Integer volunteerId) {
            this.volunteerId = volunteerId;
            return this;
        }

        public AssignmentDtoBuilder status(AssignmentStatus status) {
            this.status = status;
            return this;
        }

        public AssignmentDtoBuilder assignedAt(LocalDateTime assignedAt) {
            this.assignedAt = assignedAt;
            return this;
        }

        public AssignmentDtoBuilder completedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
            return this;
        }

        public AssignmentDto build() {
            return new AssignmentDto(id, requestId, volunteerId, status, assignedAt, completedAt);
        }
    }
}
