package com.example.portfolio.resume.controller;

import com.example.portfolio.resume.entity.Resume;
import com.example.portfolio.resume.service.ResumeService;
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

    // 이력서 상세 조회 (수정 모드용)
    @GetMapping("/{resumeId}")
    public ResponseEntity<Resume> getResume(@PathVariable Long resumeId) {
        return ResponseEntity.ok(resumeService.getResume(resumeId));
    }

    // 이력서 생성
    @PostMapping
    public ResponseEntity<?> createResume(@RequestBody ResumeRequest request) {
        resumeService.createResume(
                request.getUserId(),
                request.getTitle(), // 제목
                request.getProfileImage(),
                request.getJobGroup(),
                request.getCareer(),
                request.getLinks(),
                request.getSelfIntro(),
                false // 초기 생성 시 비공개
        );
        return ResponseEntity.ok("이력서가 등록되었습니다.");
    }

    // [추가] 이력서 수정
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

    @Data
    static class ResumeRequest {
        private Long userId;
        private String title;       // 추가
        private String profileImage;
        private String jobGroup;
        private String career;
        private String links;
        private String selfIntro;
    }
}