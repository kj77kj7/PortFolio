package com.example.portfolio.community.repository;

import com.example.portfolio.community.entity.CommunityPost;
import com.example.portfolio.community.entity.PostLike;
import com.example.portfolio.user.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    boolean existsByPostAndUser(CommunityPost post, User user);

    @Transactional
    void deleteByPostAndUser(CommunityPost post, User user);

    int countByPost(CommunityPost post);
}
