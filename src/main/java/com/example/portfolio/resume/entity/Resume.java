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

    // [추가] 프로필 사진 (Base64 문자열로 저장 - LONGTEXT)
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;

    // [추가] 직군 (여러 개 선택 가능하므로 콤마로 구분해서 저장하거나 JSON 문자열로 저장)
    private String jobGroup;

    // [추가] 총 경력 (신입, 1~3년 등 단일 선택)
    private String career;

    // [추가] 외부 링크 (여러 개일 수 있음, 텍스트로 저장)
    @Column(columnDefinition = "TEXT")
    private String links;

    // [추가] 자기소개 (기존 content 필드를 자기소개로 사용해도 되지만 명확하게 분리)
    @Column(columnDefinition = "TEXT")
    private String selfIntro;

    private String title; // 이력서 제목 (자동 생성 또는 입력)

    private boolean isShared; // 커뮤니티 공개 여부

    private String createdAt;
    private String updatedAt;
}