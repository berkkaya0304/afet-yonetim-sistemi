package com.afet.userservice.dto;

import com.afet.userservice.dto.Enum.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class UserProfileDto {
    private Integer id;
    private String fullName;
    private String email;
    private Role role;
    private Integer completedTasksCount;
    private LocalDateTime createdAt;
    private List<String> skills;
    private List<String> badges;
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public Integer getCompletedTasksCount() {
        return completedTasksCount;
    }
    
    public void setCompletedTasksCount(Integer completedTasksCount) {
        this.completedTasksCount = completedTasksCount;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<String> getSkills() {
        return skills;
    }
    
    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
    
    public List<String> getBadges() {
        return badges;
    }
    
    public void setBadges(List<String> badges) {
        this.badges = badges;
    }
}
