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

    @GetMapping("/{id}")
    public ResponseEntity<JobPostDto> getJobPost(@PathVariable Long id) {
        return jobPostRepository.findById(id)
                .map(this::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createJobPost(@RequestBody JobPostRequest request) {
        User company = userRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("기업 회원을 찾을 수 없습니다."));

        // [핵심] 공고 생성 시, 입력된 태그가 없으면 기업의 기본 태그를 가져와서 저장
        String initialTags = request.getTags();
        if (initialTags == null || initialTags.isEmpty()) {
            initialTags = company.getTags(); // 기업 태그 상속
        }

        JobPost jobPost = JobPost.builder()
                .company(company)
                .title(request.getTitle())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalCareer(request.getTotalCareer())
                .content(request.getContent())
                .jobImages(request.getJobImages())
                .tags(initialTags) // 태그 저장
                .createdAt(LocalDateTime.now().toString())
                .build();

        jobPostRepository.save(jobPost);
        return ResponseEntity.ok("공고가 등록되었습니다.");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJobPost(@PathVariable Long id, @RequestBody JobPostRequest request) {
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("공고를 찾을 수 없습니다."));

        jobPost.setTitle(request.getTitle());
        jobPost.setStartDate(request.getStartDate());
        jobPost.setEndDate(request.getEndDate());
        jobPost.setTotalCareer(request.getTotalCareer());
        jobPost.setContent(request.getContent());
        jobPost.setTags(request.getTags()); // [추가] 태그 수정 반영

        jobPostRepository.save(jobPost);
        return ResponseEntity.ok("수정이 완료되었습니다.");
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobPostDto>> getMyJobPosts(@PathVariable Long companyId) {
        List<JobPost> posts = jobPostRepository.findByCompany_IdOrderByCreatedAtDesc(companyId);
        return ResponseEntity.ok(posts.stream().map(this::convertToDto).collect(Collectors.toList()));
    }

    private JobPostDto convertToDto(JobPost post) {
        return JobPostDto.builder()
                .id(post.getId())
                .companyName(post.getCompany().getName())
                .companyAddress(post.getCompany().getAddress())
                .title(post.getTitle())
                .startDate(post.getStartDate())
                .endDate(post.getEndDate())
                .totalCareer(post.getTotalCareer())
                .content(post.getContent())
                .jobImages(post.getJobImages())
                .tags(post.getTags()) // [추가] DTO에 태그 포함
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
        private String tags; // 추가
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
        private String tags; // 추가
    }
}