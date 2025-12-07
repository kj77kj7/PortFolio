package com.example.portfolio.application.entity;

import com.example.portfolio.job.entity.JobPost;
import com.example.portfolio.resume.entity.Resume;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 제출한 이력서
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    // 지원한 공고
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id")
    private JobPost jobPost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;  // APPLIED, PASSED, FAILED

    private String createdAt;
}
