package com.example.portfolio.community.repository;

import com.example.portfolio.community.entity.Comment;
import com.example.portfolio.community.entity.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByCommunityPostOrderByCreatedAtAsc(CommunityPost post);
}