package com.afet.userservice.service;

import com.afet.userservice.dto.UserProfileDto;
import com.afet.userservice.dto.UserUpdateDto;
import com.afet.userservice.entity.User;
import com.afet.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileDto getUserProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return mapToProfileDto(user);
    }

    public UserProfileDto updateUserProfile(Integer userId, UserUpdateDto updateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updateDto.getFullName() != null) {
            user.setFullName(updateDto.getFullName());
        }
        
        // TODO: Add phone field to User entity if needed
        // TODO: Add skills management
        
        User updatedUser = userRepository.save(user);
        return mapToProfileDto(updatedUser);
    }

    public List<UserProfileDto> getAllUsers(String role, Boolean active, String skill) {
        List<User> users = userRepository.findAll();
        
        // TODO: Implement filtering logic based on parameters
        
        return users.stream()
                .map(this::mapToProfileDto)
                .collect(Collectors.toList());
    }

    public List<UserProfileDto> getAllUsers() {
        List<User> users = userRepository.findAll();

        // TODO: Implement filtering logic based on parameters

        return users.stream()
                .map(this::mapToProfileDto)
                .collect(Collectors.toList());
    }

    public UserProfileDto updateUserRole(Integer userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            user.setRole(com.afet.userservice.dto.Enum.Role.valueOf(newRole.toUpperCase()));
            User updatedUser = userRepository.save(user);
            return mapToProfileDto(updatedUser);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + newRole);
        }
    }

    public void deleteUser(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public Map<String, Object> getUserStats() {
        List<User> users = userRepository.findAll();
        
        long totalUsers = users.size();
        long activeUsers = users.stream().filter(u -> u.isEnabled()).count();
        long volunteers = users.stream().filter(u -> u.getRole() == com.afet.userservice.dto.Enum.Role.GONULLU).count();
        long admins = users.stream().filter(u -> u.getRole() == com.afet.userservice.dto.Enum.Role.YONETICI).count();
        
        return Map.of(
            "totalUsers", totalUsers,
            "activeUsers", activeUsers,
            "volunteers", volunteers,
            "admins", admins
        );
    }

    public Long getActiveVolunteersCount() {
        return userRepository.findAll().stream()
                .filter(user -> user.isEnabled() && user.getRole() == com.afet.userservice.dto.Enum.Role.GONULLU)
                .count();
    }

    private UserProfileDto mapToProfileDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .completedTasksCount(user.getCompletedTasksCount())
                .createdAt(null) // TODO: Add createdAt field to User entity
                .skills(List.of()) // TODO: Implement skills
                .badges(List.of()) // TODO: Implement badges
                .build();
    }
}
