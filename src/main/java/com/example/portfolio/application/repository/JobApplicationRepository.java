package com.example.portfolio.application.repository;

import com.example.portfolio.application.entity.JobApplication;
import com.example.portfolio.job.entity.JobPost;
import com.example.portfolio.resume.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobPost(JobPost jobpost);

    List<JobApplication> findByResume(Resume resume);

    List<JobApplication> findByResume_User_Id(Long userId);

    // [추가] 특정 공고의 지원자 수 카운트
    long countByJobPost_Id(Long jobPostId);

    // [추가] 특정 유저가 특정 공고에 지원했는지 확인 (중복 지원 체크용)
    boolean existsByJobPost_IdAndResume_User_Id(Long jobPostId, Long userId);
}
