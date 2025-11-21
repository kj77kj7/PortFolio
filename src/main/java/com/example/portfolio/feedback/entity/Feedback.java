package com.example.portfolio.feedback.entity;

import com.example.portfolio.resume.entity.Resume;
import com.example.portfolio.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "feedbacks")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 이력서에 대한 조언인가?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    // 피드백 작성자 (직장인)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id")
    private User worker;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private String createdAt;
}
