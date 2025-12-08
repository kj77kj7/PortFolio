import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/CommunityDetail.css';

const CommunityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  // 댓글 작성/수정 관련 상태
  const [commentText, setCommentText] = useState('');
  const [isEditingComment, setIsEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // 좋아요 상태
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // 1. 로그인 유저 확인
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) setUser(storedUser);

    const userId = storedUser ? storedUser.id : null;
    let url = `http://localhost:8080/api/community/${id}`;
    if (userId) {
      url += `?userId=${userId}`;
    }

    // 2. 게시글 상세 조회
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setIsLiked(!!data.liked);
      })
      .catch(err => console.error(err));

    // 3. 댓글 목록 조회
    fetchComments();
  }, [id]);

  const fetchComments = () => {
    fetch(`http://localhost:8080/api/community/${id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error(err));
  };

  // --- 게시글 관련 핸들러 ---

  // 게시글 수정 페이지로 이동
  const handleEditPost = () => {
    // 수정 모드임을 알리기 위해 state 전달 (백엔드 연동 전이라도 UI 흐름 확인 가능)
    navigate('/community/write', { state: { mode: 'edit', postData: post } });
  };

  // 좋아요 토글
  const handleLike = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    fetch(`http://localhost:8080/api/community/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
      .then(res => res.json())
      .then(data => {
        setIsLiked(data.liked);
        setPost(prev => ({
          ...prev,
          likeCount: data.likeCount,
        }));
      })
      .catch(err => console.error(err));
  };

  // --- 댓글 관련 핸들러 ---

  // 댓글 작성
  const handleSubmitComment = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!commentText.trim()) return;

    fetch(`http://localhost:8080/api/community/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, content: commentText }),
    }).then(res => {
      if (res.ok) {
        setCommentText('');
        fetchComments();
      }
    });
  };

  // 댓글 수정 모드 진입
  const startEditComment = (comment) => {
    setIsEditingComment(comment.id);
    setEditCommentText(comment.content);
  };

  // 댓글 수정 저장
  const saveEditComment = (commentId) => {
    fetch(`http://localhost:8080/api/community/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editCommentText }),
    }).then(res => {
      if (res.ok) {
        setIsEditingComment(null);
        fetchComments();
      }
    });
  };

  // 댓글 삭제
  const handleDeleteComment = (commentId) => {
    if (!window.confirm("정말로 댓글을 삭제하시겠습니까?")) return;

    fetch(`http://localhost:8080/api/community/comments/${commentId}`, {
      method: 'DELETE',
    })
    .then(res => {
      if (res.ok) {
        alert("댓글이 삭제되었습니다.");
        fetchComments();
      } else {
        alert("삭제 실패");
      }
    })
    .catch(err => console.error(err));
  };

  // 엔터 키로 댓글 등록 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) return;
      e.preventDefault();
      handleSubmitComment();
    }
  };

  if (!post) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>로딩중...</div>;
  }

  // 이미지 JSON 파싱 헬퍼
  const getImages = (jsonImages) => {
    try {
      return jsonImages ? (JSON.parse(jsonImages) || []) : [];
    } catch {
      return [];
    }
  };
  const postImages = getImages(post.images);

  return (
    <div className="cd-container">
      {/* 상단 네비게이션 */}
      <header className="cd-nav">
        <div className="cd-left-back" onClick={() => navigate('/community')}>
          ← 취소하고 돌아가기
        </div>

        <div className="cd-nav-right">
          {user ? (
            <span className="cd-mypage-btn" onClick={() => navigate('/mypage')}>
              마이페이지
            </span>
          ) : (
            <span className="cd-login-btn" onClick={() => navigate('/login')}>
              로그인
            </span>
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 래퍼 */}
      <div className="cd-wrapper">
        <h2 className="cd-main-title">커뮤니티</h2>
        <div className="cd-divider" />

        {/* 게시글 헤더 (제목 + 작성자 정보 + 수정버튼) */}
        <div className="cd-header">
          <h3 className="cd-post-title">{post.title}</h3>

          <div className="cd-author-info">
            <div className="cd-author-top">
                <span className="cd-author-name">{post.authorName}</span>
                <span className="cd-author-sub">
                {post.authorCareer || '경력미상'} ·{' '}
                {post.authorJob ? post.authorJob.split(',')[0] : '직군미상'}
                </span>
            </div>
            
            {/* 게시글 작성자 본인일 때만 '수정' 버튼 노출 */}
            {user && user.id === post.userId && (
                <div className="cd-post-edit-btn" onClick={handleEditPost}>
                    수정
                </div>
            )}
          </div>
        </div>

        {/* 이미지 영역 */}
        {postImages.length > 0 && (
          <div className="cd-img-box">
            {postImages.map((img, idx) => (
              <img key={idx} src={img} alt={`img-${idx}`} className="cd-post-img" />
            ))}
          </div>
        )}

        {/* 본문 텍스트 */}
        <p className="cd-content">{post.content}</p>

        {/* 좋아요 / 댓글수 아이콘 바 */}
        <div className="cd-actions">
          <button className="cd-icon-btn" onClick={handleLike}>
            <span
              className="cd-icon-heart"
              style={{ color: isLiked ? 'red' : '#777' }}
            >
              ♥
            </span>
            <span>{post.likeCount}</span>
          </button>

          <button className="cd-icon-btn" type="button">
            💬 <span>{comments.length}</span>
          </button>
        </div>

        {/* 댓글 리스트 */}
        <div className="cd-comment-list">
          {comments.map(comment => (
            <div key={comment.id} className="cd-comment-item">
              <div className="cd-comment-profile">
                {comment.userProfile ? (
                  <img src={comment.userProfile} alt="profile" />
                ) : (
                  <div className="gray-circle" />
                )}
              </div>

              <div className="cd-comment-body">
                {/* 댓글 메타 정보 (이름, 경력, 수정/삭제 버튼) */}
                <div className="cd-comment-meta">
                  <span className="c-name">{comment.userName}</span>
                  <span className="c-sub">
                    {comment.userCareer} · {comment.userJob ? comment.userJob.split(',')[0] : ''}
                  </span>

                  {/* 댓글 작성자 본인일 때만 수정/삭제 버튼 노출 */}
                  {user && user.id === comment.userId && isEditingComment !== comment.id && (
                    <div className="cd-comment-actions">
                        <span
                            className="cd-comment-btn"
                            onClick={() => startEditComment(comment)}
                        >
                            수정
                        </span>
                        <span className="cd-comment-divider">|</span>
                        <span
                            className="cd-comment-btn delete"
                            onClick={() => handleDeleteComment(comment.id)}
                        >
                            삭제
                        </span>
                    </div>
                  )}
                </div>

                {/* 댓글 수정 모드 vs 일반 모드 */}
                {isEditingComment === comment.id ? (
                  <div className="cd-edit-wrap">
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                    />
                    <button
                      className="save-edit-btn"
                      onClick={() => saveEditComment(comment.id)}
                    >
                      저장
                    </button>
                    <button
                      className="cancel-edit-btn"
                      onClick={() => setIsEditingComment(null)}
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <p className="c-text">{comment.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 댓글 입력창 */}
        <div className="cd-comment-input">
          <textarea
            placeholder="댓글을 남겨보세요!"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="cd-comment-save-btn" onClick={handleSubmitComment}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;