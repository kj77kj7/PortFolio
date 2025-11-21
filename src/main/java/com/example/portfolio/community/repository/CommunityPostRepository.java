package com.example.portfolio.community.repository;

import com.example.portfolio.community.entity.CommunityPost;
import com.example.portfolio.community.entity.CommunityType;
import com.example.portfolio.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    List<CommunityPost> findByUser(User user);

    List<CommunityPost> findByType(CommunityType type);
}
