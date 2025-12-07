package com.example.portfolio.application.controller;

import com.example.portfolio.application.entity.ApplicationStatus;
import com.example.portfolio.application.service.ApplicationService;
import com.example.portfolio.application.entity.JobApplication;
import com.example.portfolio.application.repository.JobApplicationRepository; // 추가
import com.example.portfolio.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final JobApplicationRepository jobApplicationRepository; // Repository 직접 주입 (편의상)

    // ... (기존 apply, getMyApplications, cancelApplication 메서드 유지) ...
    // 아래 apply 메서드는 기존 것 그대로 두시거나, 중복 지원 방지 로직이 필요하면 수정 가능합니다.
    // 여기서는 기존 코드를 유지한다고 가정하고 새로운 API만 추가합니다.

    @PostMapping
    public ResponseEntity<?> apply(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long resumeId = request.get("resumeId");
        Long jobPostId = request.get("jobPostId");

        if (resumeId == null) return ResponseEntity.badRequest().body("이력서 ID가 없습니다.");

        // [추가] 중복 지원 방지
        if (jobApplicationRepository.existsByJobPost_IdAndResume_User_Id(jobPostId, userId)) {
            return ResponseEntity.badRequest().body("이미 지원한 공고입니다.");
        }

        try {
            applicationService.apply(userId, resumeId, jobPostId);
            return ResponseEntity.ok("지원이 완료되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ... (기존 메서드들 생략) ...

    // [추가] 1. 지원자 수 조회 (누구나 볼 수 있음)
    @GetMapping("/count/{jobPostId}")
    public ResponseEntity<Long> getApplicantCount(@PathVariable Long jobPostId) {
        long count = jobApplicationRepository.countByJobPost_Id(jobPostId);
        return ResponseEntity.ok(count);
    }

    // [추가] 2. 내가 이 공고에 지원했는지 여부 확인
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkApplied(@RequestParam Long jobPostId, @RequestParam Long userId) {
        boolean applied = jobApplicationRepository.existsByJobPost_IdAndResume_User_Id(jobPostId, userId);
        return ResponseEntity.ok(applied);
    }

    // ... (기존 getApplicantsByJob, updateStatus 등 유지) ...
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getMyApplications(@PathVariable Long userId) {
        List<JobApplication> apps = applicationService.getApplicationsByUser(userId);
        List<Map<String, Object>> result = apps.stream().map(app -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", app.getId());
            map.put("status", app.getStatus());
            map.put("jobPostId", app.getJobPost().getId());
            map.put("jobTitle", app.getJobPost().getTitle());
            map.put("companyName", app.getJobPost().getCompany().getName());
            map.put("companyAddress", app.getJobPost().getCompany().getAddress());
            map.put("jobImages", app.getJobPost().getJobImages() != null ? app.getJobPost().getJobImages() : "[]");
            map.put("career", app.getJobPost().getTotalCareer());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{applicationId}")
    public ResponseEntity<?> cancelApplication(@PathVariable Long applicationId) {
        try {
            applicationService.cancelApplication(applicationId);
            return ResponseEntity.ok("지원이 철회되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/job/{jobPostId}")
    public ResponseEntity<?> getApplicantsByJob(@PathVariable Long jobPostId) {
        List<JobApplication> apps = applicationService.getApplicationsByJobpost(jobPostId);
        List<Map<String, Object>> result = apps.stream().map(app -> {
            Map<String, Object> map = new HashMap<>();
            map.put("applicationId", app.getId());
            map.put("status", app.getStatus());
            map.put("applicantName", app.getResume().getUser().getName());
            map.put("applicantCareer", app.getResume().getUser().getCareer());
            map.put("resumeTitle", app.getResume().getTitle());
            map.put("resumeId", app.getResume().getId());
            map.put("appliedAt", app.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long applicationId, @RequestBody Map<String, String> body) {
        try {
            String statusStr = body.get("status");
            ApplicationStatus status = ApplicationStatus.valueOf(statusStr);
            applicationService.updateStatus(applicationId, status);
            return ResponseEntity.ok("상태가 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("상태 변경 실패: " + e.getMessage());
        }
    }
}