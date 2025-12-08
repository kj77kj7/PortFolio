package com.example.portfolio.job.entity;

import com.example.portfolio.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "job_posts")
public class JobPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private User company;

    private String title;
    private String startDate;
    private String endDate;
    private String totalCareer;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "LONGTEXT")
    private String jobImages;

    // [추가] 공고별 태그 (예: "#복지좋음 #야근없음")
    @Column(columnDefinition = "TEXT")
    private String tags;

    private String createdAt;
}