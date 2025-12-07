package com.example.portfolio.application.service;

import com.example.portfolio.application.entity.ApplicationStatus;
import com.example.portfolio.application.entity.JobApplication;
import com.example.portfolio.application.repository.JobApplicationRepository;
import com.example.portfolio.job.entity.JobPost;
import com.example.portfolio.job.repository.JobPostRepository;
import com.example.portfolio.resume.entity.Resume;
import com.example.portfolio.resume.repository.ResumeRepository;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobPostRepository jobpostRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    /**
     * 지원하기
     */
    @Transactional
    public JobApplication apply(Long userId, Long resumeId, Long jobpostId) {

        // 지원자 확인
        User applicant = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        // 이력서 확인
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 이력서입니다."));

        // 자기 이력서인지 검증
        if (!resume.getUser().getId().equals(userId)) {
            throw new RuntimeException("자신의 이력서로만 지원할 수 있습니다.");
        }

        // 공고 확인
        JobPost jobpost = jobpostRepository.findById(jobpostId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 공고입니다."));

        // [중복 지원 방지 로직 추가 가능]
        // 이미 지원한 공고인지 확인하는 로직이 필요하다면 여기에 리포지토리 조회 추가

        JobApplication application = JobApplication.builder()
                .resume(resume)
                .jobPost(jobpost)
                .status(ApplicationStatus.APPLIED) // 초기 상태: 미정(지원완료)
                .createdAt(LocalDateTime.now().toString())
                .build();

        return jobApplicationRepository.save(application);
    }

    /**
     * 특정 공고의 지원자 목록 조회 (기업용)
     */
    public List<JobApplication> getApplicationsByJobpost(Long jobpostId) {

        JobPost jobpost = jobpostRepository.findById(jobpostId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 공고입니다."));

        return jobApplicationRepository.findByJobPost(jobpost);
    }

    /**
     * 특정 유저(취준생)의 지원 내역 조회 (개인 마이페이지용)
     */
    public List<JobApplication> getApplicationsByUser(Long userId) {
        return jobApplicationRepository.findByResume_User_Id(userId);
    }

    /**
     * 지원 상태 변경 (기업 → 지원자 합격/불합격 처리)
     */
    @Transactional
    public JobApplication updateStatus(Long applicationId, ApplicationStatus status) {

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 지원 내역입니다."));

        application.setStatus(status);

        return jobApplicationRepository.save(application);
    }

    /**
     * [추가됨] 지원 철회 (개인회원용)
     * 상태가 APPLIED(미정)일 때만 삭제 가능
     */
    @Transactional
    public void cancelApplication(Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 지원 내역입니다."));

        // 이미 결과가 나온(합격/불합격) 상태면 철회 불가
        if (application.getStatus() != ApplicationStatus.APPLIED) {
            throw new RuntimeException("이미 결과가 나온 지원 내역은 철회할 수 없습니다.");
        }

        jobApplicationRepository.delete(application);
    }
}