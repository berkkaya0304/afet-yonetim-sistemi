package com.afet.userservice.repository;

import com.afet.userservice.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Integer> {
    Optional<Skill> findByName(String name);
}
