package com.example.portfolio.job.repository;

import com.example.portfolio.job.entity.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobPostRepository extends JpaRepository<JobPost, Long> {
    // 최신순 정렬해서 가져오기
    List<JobPost> findAllByOrderByCreatedAtDesc();

    // 검색 기능 (회사명으로 검색)
    List<JobPost> findByCompany_NameContainingOrderByCreatedAtDesc(String companyName);
    List<JobPost> findByCompany_IdOrderByCreatedAtDesc(Long companyId);
}