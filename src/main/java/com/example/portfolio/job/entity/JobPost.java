package com.example.portfolio.job.entity;

import com.example.portfolio.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

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
    private String totalCareer;    // 선택된 경력들 (ex: "신입, 1~3년차")

    @Column(columnDefinition = "TEXT")
    private String content;

    // [추가] 이미지 데이터를 저장할 필드 (Base64 문자열이 길 수 있으므로 LONGTEXT 사용)
    // 실제로는 별도 테이블이나 List<String> @ElementCollection을 쓰지만, 편의상 JSON 문자열이나 구분자로 저장 가정
    @Column(columnDefinition = "LONGTEXT")
    private String jobImages; // JSON 형태의 String으로 저장 ([ "data:image...", "..." ])

    private String createdAt;
}