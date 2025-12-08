package com.example.portfolio.resume.controller;

import com.example.portfolio.resume.entity.Resume;
import com.example.portfolio.resume.service.ResumeService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    // 특정 유저의 이력서 목록 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resume>> getResumesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(resumeService.getResumesByUser(userId));
    }

    // [수정] 이력서 상세 조회 (팝업용 DTO 반환으로 변경)
    @GetMapping("/{resumeId}")
    public ResponseEntity<ResumeResponseDto> getResume(@PathVariable Long resumeId) {
        Resume resume = resumeService.getResume(resumeId);

        // Entity -> DTO 변환 (순환 참조 방지)
        UserDto userDto = UserDto.builder()
                .id(resume.getUser().getId())
                .name(resume.getUser().getName())
                .email(resume.getUser().getEmail())
                .build();

        ResumeResponseDto response = ResumeResponseDto.builder()
                .id(resume.getId())
                .title(resume.getTitle())
                .profileImage(resume.getProfileImage())
                .jobGroup(resume.getJobGroup())
                .career(resume.getCareer())
                .links(resume.getLinks())
                .selfIntro(resume.getSelfIntro())
                .user(userDto) // 유저 정보 포함
                .build();

        return ResponseEntity.ok(response);
    }

    // 이력서 생성
    @PostMapping
    public ResponseEntity<?> createResume(@RequestBody ResumeRequest request) {
        resumeService.createResume(
                request.getUserId(),
                request.getTitle(),
                request.getProfileImage(),
                request.getJobGroup(),
                request.getCareer(),
                request.getLinks(),
                request.getSelfIntro(),
                false
        );
        return ResponseEntity.ok("이력서가 등록되었습니다.");
    }

    // 이력서 수정
    @PutMapping("/{resumeId}")
    public ResponseEntity<?> updateResume(@PathVariable Long resumeId, @RequestBody ResumeRequest request) {
        resumeService.updateResume(
                resumeId,
                request.getTitle(),
                request.getProfileImage(),
                request.getJobGroup(),
                request.getCareer(),
                request.getLinks(),
                request.getSelfIntro(),
                false
        );
        return ResponseEntity.ok("이력서가 수정되었습니다.");
    }

    // === DTO 클래스 정의 ===

    @Data
    static class ResumeRequest {
        private Long userId;
        private String title;
        private String profileImage;
        private String jobGroup;
        private String career;
        private String links;
        private String selfIntro;
    }

    @Data
    @Builder
    static class ResumeResponseDto {
        private Long id;
        private String title;
        private String profileImage;
        private String jobGroup;
        private String career;
        private String links;
        private String selfIntro;
        private UserDto user; // 프론트엔드에서 selectedResume.user.name 등으로 접근하므로 필요
    }

    @Data
    @Builder
    static class UserDto {
        private Long id;
        private String name;
        private String email;
    }
}