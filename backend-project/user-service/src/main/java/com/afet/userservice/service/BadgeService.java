package com.afet.userservice.service;

import com.afet.userservice.entity.Badge;
import com.afet.userservice.entity.User;
import com.afet.userservice.entity.UserBadge;
import com.afet.userservice.repository.BadgeRepository;
import com.afet.userservice.repository.UserBadgeRepository;
import com.afet.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    @Transactional
    public void processTaskCompletion(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Kullanıcının görev sayacını artır
        user.setCompletedTasksCount(user.getCompletedTasksCount() + 1);
        userRepository.save(user);
        log.info("User {} completed task count updated to: {}", userId, user.getCompletedTasksCount());

        // 2. Rozet kurallarını kontrol et
        checkAndAwardBadge(user, "İlk Adım", 1);
        checkAndAwardBadge(user, "Yardımsever", 5);
        // ... diğer rozet kuralları buraya eklenebilir ...
    }

    @Transactional
    public void awardBadgeManually(Integer userId, Integer badgeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new RuntimeException("Badge not found"));

        if (!userBadgeRepository.existsByUserAndBadge(user, badge)) {
            UserBadge newUserBadge = UserBadge.builder().user(user).badge(badge).build();
            userBadgeRepository.save(newUserBadge);
            log.info("Manually awarded badge '{}' to user {}", badge.getName(), user.getId());
        } else {
            log.warn("User {} already has the badge '{}'", user.getId(), badge.getName());
        }
    }

    private void checkAndAwardBadge(User user, String badgeName, int requiredTasks) {
        if (user.getCompletedTasksCount() >= requiredTasks) {
            badgeRepository.findByName(badgeName).ifPresent(badge -> {
                // Bu rozeti daha önce kazanmamışsa ver
                if (!userBadgeRepository.existsByUserAndBadge(user, badge)) {
                    UserBadge newUserBadge = UserBadge.builder()
                            .user(user)
                            .badge(badge)
                            .build();
                    userBadgeRepository.save(newUserBadge);
                    log.info("Awarded badge '{}' to user {}", badgeName, user.getId());
                }
            });
        }
    }
}