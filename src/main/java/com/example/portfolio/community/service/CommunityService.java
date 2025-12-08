package com.example.portfolio.community.service;

import com.example.portfolio.community.entity.CommunityPost;
import com.example.portfolio.community.repository.CommunityPostRepository;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public CommunityPost createPost(Long userId, String title, String content, String images) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        CommunityPost post = CommunityPost.builder()
                .user(user)
                .title(title)
                .content(content)
                .images(images)
                .viewCount(0)
                .likeCount(0)
                .commentCount(0)
                .createdAt(LocalDateTime.now().toString())
                .build();

        return communityPostRepository.save(post);
    }

    /**
     * 게시글 수정
     */
    @Transactional
    public CommunityPost updatePost(Long postId, String title, String content, String images) {

        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 게시글입니다."));

        post.setTitle(title);
        post.setContent(content);
        post.setImages(images);

        return communityPostRepository.save(post);
    }

    /**
     * 게시글 삭제
     */
    @Transactional
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
     * 전체 게시글 목록 (최신순)
     */
    public List<CommunityPost> getAllPosts() {
        return communityPostRepository.findAllByOrderByCreatedAtDesc();
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