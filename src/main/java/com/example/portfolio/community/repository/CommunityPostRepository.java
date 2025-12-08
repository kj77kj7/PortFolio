package com.example.portfolio.community.repository;

import com.example.portfolio.community.entity.CommunityPost;
import com.example.portfolio.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {
    // 최신순 정렬
    List<CommunityPost> findAllByOrderByCreatedAtDesc();

    // 특정 유저가 쓴 글 조회
    List<CommunityPost> findByUser(User user);

    // [추가] 추천수 높은 순으로 상위 3개 조회
    List<CommunityPost> findTop3ByOrderByLikeCountDesc();
}