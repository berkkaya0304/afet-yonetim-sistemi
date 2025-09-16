package com.afet.userservice.repository;

import com.afet.userservice.entity.Badge;
import com.afet.userservice.entity.User;
import com.afet.userservice.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Integer> {
    boolean existsByUserAndBadge(User user, Badge badge);
    List<UserBadge> findByBadge(Badge badge);
}
