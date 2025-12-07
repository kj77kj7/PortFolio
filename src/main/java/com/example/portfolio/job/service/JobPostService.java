package com.example.portfolio.job.service;

import com.example.portfolio.job.entity.JobPost;
import com.example.portfolio.job.repository.JobPostRepository;
import com.example.portfolio.user.entity.Role;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostService {

    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;

    /**
     * 공고 생성 (기업 전용)
     * 수정사항: 프론트엔드 입력값(시작일, 종료일, 총 경력, 상세내용)에 맞춰 파라미터 변경
     */
    @Transactional
    public JobPost createJobPost(Long companyUserId, String title, String startDate, String endDate, String totalCareer, String content) {

        User company = userRepository.findById(companyUserId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        // 역할 체크 (기업만 공고 생성 가능)
        if (company.getRole() != Role.COMPANY) {
            throw new RuntimeException("기업 계정만 공고를 등록할 수 있습니다.");
        }

        JobPost jobPost = JobPost.builder()
                .company(company)
                .title(title)
                .startDate(startDate)      // 추가됨
                .endDate(endDate)          // 추가됨
                .totalCareer(totalCareer)  // 추가됨
                .content(content)          // description -> content 변경
                .createdAt(LocalDateTime.now().toString())
                .build();

        return jobPostRepository.save(jobPost);
    }

    /**
     * 공고 수정
     */
    @Transactional
    public JobPost updateJobPost(Long jobPostId, String title, String startDate, String endDate, String totalCareer, String content) {

        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 공고입니다."));

        jobPost.setTitle(title);
        jobPost.setStartDate(startDate);
        jobPost.setEndDate(endDate);
        jobPost.setTotalCareer(totalCareer);
        jobPost.setContent(content);

        return jobPostRepository.save(jobPost);
    }

    /**
     * 공고 삭제
     */
    @Transactional
    public void deleteJobPost(Long jobPostId) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 공고입니다."));
        jobPostRepository.delete(jobPost);
    }

    /**
     * 단일 공고 조회
     */
    public JobPost getJobPost(Long jobPostId) {
        return jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 공고입니다."));
    }

    /**
     * 전체 공고 목록 (최신순)
     */
    public List<JobPost> getAllJobPosts() {
        return jobPostRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * 검색 기능 (회사명 포함)
     */
    public List<JobPost> searchJobPosts(String keyword) {
        return jobPostRepository.findByCompany_NameContainingOrderByCreatedAtDesc(keyword);
    }
}