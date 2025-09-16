package com.afet.userservice.repository;

import com.afet.userservice.entity.Skill;
import com.afet.userservice.entity.User;
import com.afet.userservice.entity.UserSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, Integer> {
    List<UserSkill> findByUser(User user);
    boolean existsByUserAndSkill(User user, Skill skill);
    void deleteByUserAndSkill(User user, Skill skill);
}
