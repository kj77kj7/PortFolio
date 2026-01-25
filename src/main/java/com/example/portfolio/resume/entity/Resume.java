package com.example.portfolio.resume.entity;

import com.example.portfolio.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "resumes")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 작성자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 프로필 사진
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;

    // 직군
    private String jobGroup;

    // 총 경력
    private String career;

    // 외부 링크
    @Column(columnDefinition = "TEXT")
    private String links;

    // 자기소개
    @Column(columnDefinition = "TEXT")
    private String selfIntro;

    // [추가] 사용자 정의 섹션 (JSON 문자열로 저장)
    @Column(columnDefinition = "LONGTEXT")
    private String customSections;

    private String title; // 이력서 제목

    private boolean isShared; // 커뮤니티 공개 여부

    private String createdAt;
    private String updatedAt;
}