package com.afet.assignmentservice.entity;

import com.afet.assignmentservice.dto.Enum.AssignmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "assignments")
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private Integer requestId;

    @Column(nullable = false)
    private Integer volunteerId;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssignmentStatus status = AssignmentStatus.ATANMIS;

    @CreationTimestamp
    private LocalDateTime assignedAt;

    private LocalDateTime completedAt;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getRequestId() {
        return requestId;
    }

    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public Integer getVolunteerId() {
        return volunteerId;
    }

    public void setVolunteerId(Integer volunteerId) {
        this.volunteerId = volunteerId;
    }

    public AssignmentStatus getStatus() {
        return status;
    }

    public void setStatus(AssignmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public static AssignmentBuilder builder() {
        return new AssignmentBuilder();
    }

    public static class AssignmentBuilder {
        private Integer id;
        private Integer requestId;
        private Integer volunteerId;
        private AssignmentStatus status = AssignmentStatus.ATANMIS;
        private LocalDateTime assignedAt;
        private LocalDateTime completedAt;

        public AssignmentBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public AssignmentBuilder requestId(Integer requestId) {
            this.requestId = requestId;
            return this;
        }

        public AssignmentBuilder volunteerId(Integer volunteerId) {
            this.volunteerId = volunteerId;
            return this;
        }

        public AssignmentBuilder status(AssignmentStatus status) {
            this.status = status;
            return this;
        }

        public AssignmentBuilder assignedAt(LocalDateTime assignedAt) {
            this.assignedAt = assignedAt;
            return this;
        }

        public AssignmentBuilder completedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
            return this;
        }

        public Assignment build() {
            return new Assignment(id, requestId, volunteerId, status, assignedAt, completedAt);
        }
    }
}