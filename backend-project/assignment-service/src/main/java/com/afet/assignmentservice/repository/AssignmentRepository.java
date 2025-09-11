package com.afet.assignmentservice.repository;

import com.afet.assignmentservice.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Integer> {
    List<Assignment> findByVolunteerId(Integer volunteerId);
}