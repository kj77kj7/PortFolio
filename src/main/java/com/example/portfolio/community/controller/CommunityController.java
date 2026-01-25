package com.example.portfolio.community.controller;

import com.example.portfolio.community.entity.Comment;
import com.example.portfolio.community.entity.CommunityPost;
import com.example.portfolio.community.entity.PostLike;
import com.example.portfolio.community.repository.CommentRepository;
import com.example.portfolio.community.repository.CommunityPostRepository;
import com.example.portfolio.community.repository.PostLikeRepository;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityPostRepository communityPostRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;

    // 1. 게시글 목록 조회 (전체)
    @GetMapping
    public ResponseEntity<List<CommunityDto>> getAllPosts() {
        List<CommunityPost> posts = communityPostRepository.findAllByOrderByCreatedAtDesc();
        List<CommunityDto> dtos = posts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // [추가] 홈 화면용 인기 게시글 (Top 3) 조회
    @GetMapping("/top")
    public ResponseEntity<List<CommunityDto>> getTopPosts() {
        // 추천수 내림차순 상위 3개 조회 (Repository에 메소드 추가 필요)
        List<CommunityPost> topPosts = communityPostRepository.findTop3ByOrderByLikeCountDesc();

        List<CommunityDto> dtos = topPosts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // [추가] 특정 유저가 쓴 게시글 목록 조회 (마이페이지용)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CommunityDto>> getMyPosts(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        List<CommunityPost> posts = communityPostRepository.findByUser(user);
        // ID 내림차순 정렬 (최신글 위로)
        posts.sort((a, b) -> b.getId().compareTo(a.getId()));

        List<CommunityDto> dtos = posts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // 2. 게시글 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<CommunityDto> getPost(
            @PathVariable Long id,
            @RequestParam(value = "userId", required = false) Long userId
    ) {
        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        // 조회수 증가
        post.setViewCount(post.getViewCount() + 1);
        communityPostRepository.save(post);

        boolean liked = false;
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                liked = postLikeRepository.existsByPostAndUser(post, user);
            }
        }

        CommunityDto dto = convertToDto(post);
        dto.setLiked(liked);

        return ResponseEntity.ok(dto);
    }

    // 3. 게시글 작성
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        CommunityPost post = CommunityPost.builder()
                .user(user)
                .title((String) request.get("title"))
                .content((String) request.get("content"))
                .images((String) request.get("images"))
                .viewCount(0).likeCount(0).commentCount(0)
                .createdAt(LocalDateTime.now().toString())
                .build();

        communityPostRepository.save(post);
        return ResponseEntity.ok("게시글이 등록되었습니다.");
    }

    // 4. 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        post.setTitle((String) request.get("title"));
        post.setContent((String) request.get("content"));
        post.setImages((String) request.get("images"));

        communityPostRepository.save(post);
        return ResponseEntity.ok("게시글이 수정되었습니다.");
    }

    // 5. 추천(좋아요) 토글
    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request
    ) {
        Long userId = Long.valueOf(request.get("userId").toString());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        boolean alreadyLiked = postLikeRepository.existsByPostAndUser(post, user);

        if (alreadyLiked) {
            postLikeRepository.deleteByPostAndUser(post, user);
        } else {
            PostLike like = PostLike.builder()
                    .post(post)
                    .user(user)
                    .build();
            postLikeRepository.save(like);
        }

        // 최신 좋아요 수 재계산
        int likeCount = postLikeRepository.countByPost(post);
        post.setLikeCount(likeCount);
        communityPostRepository.save(post);

        return ResponseEntity.ok(Map.of(
                "liked", !alreadyLiked,
                "likeCount", likeCount
        ));
    }

    // 6. 댓글 작성
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        Long userId = Long.valueOf(request.get("userId").toString());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        Comment comment = Comment.builder()
                .communityPost(post)
                .user(user)
                .content((String) request.get("content"))
                .createdAt(LocalDateTime.now().toString())
                .build();

        commentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        communityPostRepository.save(post);

        return ResponseEntity.ok("댓글 작성 완료");
    }

    // 7. 댓글 목록 조회
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long id) {
        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));
        List<Comment> comments = commentRepository.findByCommunityPostOrderByCreatedAtAsc(post);

        List<CommentDto> dtos = comments.stream().map(c -> CommentDto.builder()
                .id(c.getId())
                .userId(c.getUser().getId())
                .userName(c.getUser().getName())
                .userProfile(c.getUser().getProfileImage())
                .userCareer(c.getUser().getCareer())
                .userJob(c.getUser().getJobGroup())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // 8. 댓글 수정
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable Long commentId, @RequestBody Map<String, String> body) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));
        comment.setContent(body.get("content"));
        commentRepository.save(comment);
        return ResponseEntity.ok("댓글 수정 완료");
    }

    // 9. 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        commentRepository.deleteById(commentId);
        return ResponseEntity.ok("댓글이 삭제되었습니다.");
    }

    // DTO 변환 메서드
    private CommunityDto convertToDto(CommunityPost post) {
        return CommunityDto.builder()
                .id(post.getId())
                .userId(post.getUser().getId())
                .title(post.getTitle())
                .content(post.getContent())
                .images(post.getImages())
                .authorName(post.getUser().getName())
                .authorCareer(post.getUser().getCareer())
                .authorJob(post.getUser().getJobGroup())
                .authorProfile(post.getUser().getProfileImage())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .createdAt(post.getCreatedAt().split("T")[0])
                .build();
    }

    @Data
    @Builder
    static class CommunityDto {
        private Long id;
        private Long userId;
        private String title;
        private String content;
        private String images;
        private String authorName;
        private String authorCareer;
        private String authorJob;
        private String authorProfile;
        private int viewCount;
        private int likeCount;
        private int commentCount;
        private String createdAt;
        private boolean liked;
    }

    @Data
    @Builder
    static class CommentDto {
        private Long id;
        private Long userId;
        private String userName;
        private String userProfile;
        private String userCareer;
        private String userJob;
        private String content;
        private String createdAt;
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        // 게시글 존재 여부 확인 후 삭제
        CommunityPost post = communityPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        // 연관된 데이터(좋아요, 댓글)는 DB 설정(CASCADE)에 따라 다를 수 있으나,
        // JPA 기본적인 삭제를 수행합니다.
        communityPostRepository.delete(post);

        return ResponseEntity.ok("게시글이 삭제되었습니다.");
    }
}