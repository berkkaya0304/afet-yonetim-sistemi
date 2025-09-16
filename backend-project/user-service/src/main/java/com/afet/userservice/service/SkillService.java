package com.afet.userservice.service;

import com.afet.userservice.dto.SkillDto;
import com.afet.userservice.entity.Skill;
import com.afet.userservice.entity.User;
import com.afet.userservice.entity.UserSkill;
import com.afet.userservice.repository.SkillRepository;
import com.afet.userservice.repository.UserRepository;
import com.afet.userservice.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;

    public List<SkillDto> getAllSkills() {
        return skillRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SkillDto createSkill(SkillDto skillDto) {
        Skill skill = Skill.builder()
                .name(skillDto.getName())
                .description(skillDto.getDescription())
                .category(skillDto.getCategory())
                .build();
        
        Skill savedSkill = skillRepository.save(skill);
        return mapToDto(savedSkill);
    }

    public void addSkillToUser(Integer userId, Integer skillId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        if (!userSkillRepository.existsByUserAndSkill(user, skill)) {
            UserSkill userSkill = UserSkill.builder()
                    .user(user)
                    .skill(skill)
                    .build();
            userSkillRepository.save(userSkill);
        }
    }

    public void removeSkillFromUser(Integer userId, Integer skillId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        userSkillRepository.deleteByUserAndSkill(user, skill);
    }

    private SkillDto mapToDto(Skill skill) {
        return SkillDto.builder()
                .id(skill.getId())
                .name(skill.getName())
                .description(skill.getDescription())
                .category(skill.getCategory())
                .build();
    }
}
