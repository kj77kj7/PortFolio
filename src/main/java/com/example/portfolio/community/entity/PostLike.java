package com.example.portfolio.community.entity;

import com.example.portfolio.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "post_likes")
public class PostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 게시글에 대한 좋아요인지
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "post_id")
    private CommunityPost post;

    // 어떤 유저가 누른 좋아요인지
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
