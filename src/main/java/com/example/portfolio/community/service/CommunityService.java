package com.example.portfolio.community.service;

import com.example.portfolio.community.entity.CommunityPost;
import com.example.portfolio.community.entity.CommunityType;
import com.example.portfolio.community.repository.CommunityPostRepository;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityPostRepository communityPostRepository;
    private final UserRepository userRepository;

    /**
     * 게시글 생성
     */
    public CommunityPost createPost(Long userId, String title, String body, CommunityType type) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        CommunityPost post = CommunityPost.builder()
                .user(user)
                .title(title)
                .body(body)
                .type(type)
                .createdAt(LocalDateTime.now().toString())
                .build();

        return communityPostRepository.save(post);
    }

    /**
     * 게시글 수정
     */
    public CommunityPost updatePost(Long postId, String title, String body, CommunityType type) {

        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 게시글입니다."));

        post.setTitle(title);
        post.setBody(body);
        post.setType(type);

        return communityPostRepository.save(post);
    }

    /**
     * 게시글 삭제
     */
    public void deletePost(Long postId) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 게시글입니다."));

        communityPostRepository.delete(post);
    }

    /**
     * 게시글 단건 조회
     */
    public CommunityPost getPost(Long postId) {
        return communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 게시글입니다."));
    }

    /**
     * 전체 게시글 목록
     */
    public List<CommunityPost> getAllPosts() {
        return communityPostRepository.findAll();
    }

    /**
     * 타입별 게시글 조회
     * ex) QNA / RESUME_SHARE / FEEDBACK
     */
    public List<CommunityPost> getPostsByType(CommunityType type) {
        return communityPostRepository.findByType(type);
    }

    /**
     * 특정 사용자의 작성글 목록
     */
    public List<CommunityPost> getPostsByUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        return communityPostRepository.findByUser(user);
    }
}
