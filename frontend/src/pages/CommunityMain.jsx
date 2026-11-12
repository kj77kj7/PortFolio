import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Community.css';

const CommunityMain = () => {
  const navigate = useNavigate();
  
  // [로직] 게시글 목록 데이터 및 상태 관리
  const [posts, setPosts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // [로직] 1. 로그인 세션 체크
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        setIsLoggedIn(true);
        setUserName(user.name);
    }

    // [로직] 2. 게시글 목록 불러오기 (백엔드 API 호출)
    fetch('http://localhost:8080/api/community')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error("게시글 로드 실패:", err));
  }, []);

  // [로직] 로그아웃 핸들러
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="comm-container">
      {/* [디자인] 상단 네비게이션 (CommunityMain1.jsx 스타일) */}
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
          {isLoggedIn ? (
             <div style={{display:'flex', gap:'10px'}}>
                <button className="login-box-btn" onClick={() => navigate('/mypage')}>
                  {userName}님
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

      <main className="comm-content">
        
        {/* [디자인] 1. 타이틀 섹션 */}
        <div className="comm-header-section">
            <h1 className="comm-title">커뮤니티</h1>
        </div>

        {/* [디자인] 2. 버튼 섹션 */}
        <div className="comm-btn-row">
            <button className="comm-write-btn" onClick={() => navigate('/community/write')}>
                글쓰기
            </button>
        </div>

        {/* [디자인] 3. 리스트 섹션 (테이블) */}
        <div className="comm-table-container">
            <table className="comm-table">
                <thead>
                    <tr>
                        <th style={{width:'8%'}}>번호</th>
                        <th style={{width:'10%'}}>직군</th>
                        <th style={{width:'45%'}}>제목</th>
                        <th style={{width:'12%'}}>글쓴이</th>
                        <th style={{width:'13%'}}>작성일</th>
                        <th style={{width:'6%'}}>조회</th>
                        <th style={{width:'6%'}}>추천</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="no-data-msg">
                                등록된 게시글이 없습니다.
                            </td>
                        </tr>
                    ) : (
                        posts.map((post) => (
                            <tr key={post.id} className="comm-row">
                                {/* [로직] ID 표시 */}
                                <td className="comm-id">{post.id}</td>
                                
                                {/* [로직] 직군 표시 */}
                                <td>
                                    <span className="job-badge">
                                        {post.authorJob ? post.authorJob.split(',')[0] : '미설정'}
                                    </span>
                                </td>
                                
                                {/* [로직] 제목 및 댓글수 */}
                                <td className="text-left">
                                    <span 
                                        className="comm-post-title" 
                                        onClick={() => navigate(`/community/${post.id}`)}
                                    >
                                        {post.title}
                                    </span>
                                    {post.commentCount > 0 && (
                                        <span className="comment-cnt">[{post.commentCount}]</span>
                                    )}
                                </td>
                                
                                {/* [로직] 글쓴이 + 경력 정보 통합 표시 */}
                                <td className="comm-author">
                                    {post.authorName}
                                    <span style={{fontSize:'11px', color:'#888', marginLeft:'4px'}}>
                                        ({post.authorCareer || '경력미상'})
                                    </span>
                                </td>
                                
                                {/* [로직] 작성일 */}
                                <td className="comm-date">
                                    {post.createdAt ? post.createdAt.substring(0, 10) : '-'}
                                </td>
                                
                                {/* [로직] 조회수 */}
                                <td className="comm-count">{post.viewCount}</td>
                                
                                {/* [로직] 추천수 */}
                                <td className="comm-count like">{post.likeCount}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </main>
    </div>
  );
};

export default CommunityMain;