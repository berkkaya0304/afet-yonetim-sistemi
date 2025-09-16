package com.afet.userservice.controller;

import com.afet.userservice.dto.SkillDto;
import com.afet.userservice.service.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public ResponseEntity<List<SkillDto>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @PostMapping
    public ResponseEntity<SkillDto> createSkill(@RequestBody SkillDto skillDto) {
        return ResponseEntity.ok(skillService.createSkill(skillDto));
    }

    @PostMapping("/users/{userId}/skills")
    public ResponseEntity<Void> addSkillToUser(
            @PathVariable Integer userId,
            @RequestParam Integer skillId) {
        skillService.addSkillToUser(userId, skillId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{userId}/skills/{skillId}")
    public ResponseEntity<Void> removeSkillFromUser(
            @PathVariable Integer userId,
            @PathVariable Integer skillId) {
        skillService.removeSkillFromUser(userId, skillId);
        return ResponseEntity.ok().build();
    }
}
