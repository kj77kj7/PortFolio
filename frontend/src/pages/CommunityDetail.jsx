import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/CommunityDetail.css';

const CommunityDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // [로직] 상태 관리
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  // [로직] 댓글 작성/수정 관련 상태
  const [commentText, setCommentText] = useState('');
  const [isEditingComment, setIsEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  // [로직] 좋아요 상태
  const [isLiked, setIsLiked] = useState(false);

  // [디자인 지원] 헤더 UI를 위한 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // [로직] 1. 로그인 유저 확인
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
        setUser(storedUser);
        setIsLoggedIn(true);
    } else {
        setIsLoggedIn(false);
    }

    const userId = storedUser ? storedUser.id : null;
    let url = `http://localhost:8080/api/community/${id}`;
    if (userId) {
      url += `?userId=${userId}`;
    }

    // [로직] 2. 게시글 상세 조회
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setIsLiked(!!data.liked);
      })
      .catch(err => console.error(err));

    // [로직] 3. 댓글 목록 조회
    fetchComments();
  }, [id]);

  const fetchComments = () => {
    fetch(`http://localhost:8080/api/community/${id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error(err));
  };

  // [디자인 지원] 로그아웃 핸들러
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  // --- [로직] 게시글 관련 핸들러 ---

  // 게시글 수정 페이지로 이동
  const handleEditPost = () => {
    navigate('/community/write', { state: { mode: 'edit', postData: post } });
  };

  // [추가된 로직] 게시글 삭제
  const handleDeletePost = () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까? 복구할 수 없습니다.")) return;

    fetch(`http://localhost:8080/api/community/${id}`, {
      method: 'DELETE',
    })
    .then(res => {
      if (res.ok) {
        alert("게시글이 삭제되었습니다.");
        navigate('/community'); // 목록 화면으로 이동
      } else {
        // 서버에서 에러 메시지를 텍스트로 줄 경우를 대비해 처리 (선택사항)
        res.text().then(text => alert(text || "삭제 실패")); 
      }
    })
    .catch(err => console.error(err));
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

  // --- [로직] 댓글 관련 핸들러 ---

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

  // 엔터 키로 댓글 등록
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
      {/* [디자인] 상단 네비게이션 바 */}
      <header className="navbar">
        <div className="logo-area" onClick={() => navigate('/')}>
            <img 
                src="/img/logo.png" 
                alt="커리어친구들" 
                className="nav-logo-img"
                onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='커리어친구들';}} 
            />
        </div>
        
        <nav className="nav-links">
          <button className="nav-text-link" onClick={() => navigate('/jobs')}>구인구직</button>
          <button className="nav-text-link" onClick={() => navigate('/companies')}>회사정보</button>
          <button className="nav-text-link active" style={{color:'#397EFF'}} onClick={() => navigate('/community')}>커뮤니티</button>
        </nav>

        <div className="auth-area">
          {isLoggedIn && user ? (
             <div style={{display:'flex', gap:'10px'}}>
                <button className="login-box-btn" onClick={() => navigate('/mypage')}>
                  {user.name}님
                </button>
                <button className="login-box-btn" onClick={handleLogout} style={{width:'100px', color:'#333'}}>
                  로그아웃
                </button>
             </div>
          ) : (
             <button className="login-box-btn" onClick={() => navigate('/login')}>
               회원가입 / 로그인
             </button>
          )}
        </div>
      </header>
      
      {/* [디자인] '취소하고 돌아가기' 위치 */}
      <div className="back-link-area-wrapper">
        <div className="back-link-area" onClick={() => navigate('/community')}>
          ← 취소하고 돌아가기
        </div>
      </div>

      {/* [디자인] 메인 콘텐츠 래퍼 */}
      <div className="cd-wrapper">
        
        {/* [디자인] 커뮤니티 타이틀 */}
        <div className="cd-header-box">
             <h2 className="cd-main-title">커뮤니티</h2>
        </div>

        {/* [디자인] 게시글 헤더 (제목 + 작성자 정보) */}
        <div className="cd-post-header-area">
            
            {/* 게시글 제목 */}
            <h3 className="cd-post-title">{post.title}</h3>

            {/* 작성자 정보 (우측 상단) */}
            <div className="cd-author-info-box">
                <span className="cd-author-name-text">{post.authorName}</span>
                <div className="cd-author-details-text">
                    <span className="cd-author-sub-text">{post.authorCareer || '경력미상'}</span>
                    <span className="cd-author-sub-text-separator">·</span>
                    <span className="cd-author-sub-text">{post.authorJob ? post.authorJob.split(',')[0] : '직군미상'}</span>
                </div>
            </div>
        </div>
        
        {/* [디자인] 이미지 영역 */}
        {postImages.length > 0 && (
          <div className="cd-img-box">
            {postImages.map((img, idx) => (
              <img key={idx} src={img} alt={`img-${idx}`} className="cd-post-img" />
            ))}
          </div>
        )}

        {/* [디자인] 본문 텍스트 */}
        <p className="cd-content">{post.content}</p>
        
        {/* [디자인] 작성일자 */}
        <div className="cd-post-date-wrapper">
            <span className="cd-post-date-text">
                {post.createdAt ? post.createdAt.substring(0, 10) : '-'}
            </span>
        </div>
        
        {/* [디자인] 좋아요 / 댓글수 아이콘 바 */}
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
        
        {/* [디자인] 댓글 영역 시작 구분선 */}
        <div className="cd-divider" />
        
        {/* [디자인] 댓글 섹션 */}
        <h4 className="cd-comment-section-title">댓글 ({comments.length})</h4>

        {/* [디자인] 댓글 리스트 */}
        <div className="cd-comment-list">
          {comments.map(comment => (
            <div key={comment.id} className="cd-comment-item">
              <div className="cd-comment-profile">
                {comment.userProfile ? (
                  <img src={comment.userProfile} alt="profile" />
                ) : (
                  <div className="gray-circle-placeholder" />
                )}
              </div>

              <div className="cd-comment-body">
                {/* 댓글 메타 정보 */}
                <div className="cd-comment-meta">
                  <span className="c-name">{comment.userName}</span>
                  <span className="c-sub">
                    {comment.userCareer} · {comment.userJob ? comment.userJob.split(',')[0] : ''}
                  </span>

                  {/* [로직] 댓글 작성자 본인일 때만 수정/삭제 버튼 노출 */}
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

                {/* [로직] 댓글 수정 모드 vs 일반 모드 */}
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

        {/* [디자인] 하단 댓글 입력창 */}
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
        
        {/* [디자인+로직] 하단 게시글 수정/삭제 버튼 (작성자 본인만 표시) */}
        {user && user.id === post.userId && (
            <div className="cd-edit-action-bar">
                <button className="cd-edit-btn-large" onClick={handleEditPost}>
                    수정
                </button>
                {/* 추가된 삭제 버튼 */}
                <button className="cd-delete-btn-large" onClick={handleDeletePost}>
                    삭제
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default CommunityDetail;