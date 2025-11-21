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

    // 작성자 (취준생)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;   // JSON 또는 일반 텍스트

    private String pdfUrl;

    private boolean isShared; // 커뮤니티 공개 여부

    private String createdAt;
    private String updatedAt;
}
