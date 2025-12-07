package com.example.portfolio.job.controller;

import com.example.portfolio.job.entity.JobPost;
import com.example.portfolio.job.repository.JobPostRepository;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobPostController {

    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;

    // 1. 공고 목록 조회
    @GetMapping
    public ResponseEntity<List<JobPostDto>> getJobPosts(@RequestParam(required = false) String search) {
        List<JobPost> posts;
        if (search != null && !search.isEmpty()) {
            posts = jobPostRepository.findByCompany_NameContainingOrderByCreatedAtDesc(search);
        } else {
            posts = jobPostRepository.findAllByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(posts.stream().map(this::convertToDto).collect(Collectors.toList()));
    }

    // [핵심 수정] 2. 공고 상세 조회 (이게 없어서 404 에러가 났습니다)
    @GetMapping("/{id}")
    public ResponseEntity<JobPostDto> getJobPost(@PathVariable Long id) {
        return jobPostRepository.findById(id)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. 공고 작성
    @PostMapping
    public ResponseEntity<?> createJobPost(@RequestBody JobPostRequest request) {
        User company = userRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("기업 회원을 찾을 수 없습니다."));

        JobPost jobPost = JobPost.builder()
                .company(company)
                .title(request.getTitle())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalCareer(request.getTotalCareer())
                .content(request.getContent())
                .jobImages(request.getJobImages())
                .createdAt(LocalDateTime.now().toString())
                .build();

        jobPostRepository.save(jobPost);
        return ResponseEntity.ok("공고가 등록되었습니다.");
    }

    // 4. 기업별 공고 조회
    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobPostDto>> getMyJobPosts(@PathVariable Long companyId) {
        List<JobPost> posts = jobPostRepository.findByCompany_IdOrderByCreatedAtDesc(companyId);
        return ResponseEntity.ok(posts.stream().map(this::convertToDto).collect(Collectors.toList()));
    }

    // DTO 변환 메서드
    private JobPostDto convertToDto(JobPost post) {
        return JobPostDto.builder()
                .id(post.getId())
                .companyName(post.getCompany().getName())
                .companyAddress(post.getCompany().getAddress())
                .title(post.getTitle())
                .startDate(post.getStartDate())
                .endDate(post.getEndDate())
                .totalCareer(post.getTotalCareer())
                .content(post.getContent()) // 상세 내용도 포함
                .jobImages(post.getJobImages())
                .build();
    }

    @Data
    @Builder
    static class JobPostDto {
        private Long id;
        private String companyName;
        private String companyAddress;
        private String title;
        private String startDate;
        private String endDate;
        private String totalCareer;
        private String content;
        private String jobImages;
    }

    @Data
    static class JobPostRequest {
        private Long companyId;
        private String title;
        private String startDate;
        private String endDate;
        private String totalCareer;
        private String content;
        private String jobImages;
    }
}