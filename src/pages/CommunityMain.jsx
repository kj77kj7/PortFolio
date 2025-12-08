import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Community.css';

const CommunityMain = () => {
  const navigate = useNavigate();
  
  // 게시글 목록 데이터
  const [posts, setPosts] = useState([]);
  
  // 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // 1. 로그인 세션 체크
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        setIsLoggedIn(true);
        setUserName(user.name);
    }

    // 2. 게시글 목록 불러오기 (백엔드 API 호출)
    fetch('http://localhost:8080/api/community')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error("게시글 로드 실패:", err));
  }, []);

  // 로그아웃 핸들러
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="comm-container">
      {/* 헤더 네비게이션 */}
      <header className="navbar" style={{height:'80px', padding:'0 50px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee'}}>
        <div className="logo-area">
            <h1 className="nav-logo" onClick={() => navigate('/')} style={{color:'#2E7D32', fontSize:'26px', fontWeight:'bold', cursor:'pointer'}}>
                커리어친구들
            </h1>
        </div>
        <nav className="nav-links" style={{display:'flex', gap:'6vw', fontSize:'18px', fontWeight:'bold'}}>
            <span onClick={() => navigate('/jobs')} style={{cursor:'pointer'}}>구인구직</span>
            <span onClick={() => navigate('/companies')} style={{cursor:'pointer'}}>회사정보</span>
            <span onClick={() => navigate('/community')} style={{color:'#2E7D32', cursor:'pointer'}}>커뮤니티</span>
        </nav>
        <div className="auth-btn-area">
          {isLoggedIn ? (
            <>
                <button 
                    className="nav-btn" 
                    onClick={() => navigate('/mypage')}
                    style={{padding:'8px 20px', borderRadius:'4px', border:'1px solid #ddd', backgroundColor:'white', color:'#4285F4', fontWeight:'bold', cursor:'pointer', marginRight:'10px'}}
                >
                    마이페이지 ({userName})
                </button>
                <button 
                    className="nav-btn logout-btn" 
                    onClick={handleLogout}
                    style={{padding:'8px 20px', borderRadius:'4px', border:'1px solid #ddd', backgroundColor:'white', color:'#4285F4', fontWeight:'bold', cursor:'pointer'}}
                >
                    로그아웃
                </button>
            </>
          ) : (
            <button 
                className="nav-btn" 
                onClick={() => navigate('/login')}
                style={{padding:'8px 20px', borderRadius:'4px', border:'1px solid #ddd', backgroundColor:'white', color:'#4285F4', fontWeight:'bold', cursor:'pointer'}}
            >
                회원가입 / 로그인
            </button>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="comm-content">
        <div className="comm-title-row">
            <h2 className="comm-page-title">커뮤니티</h2>
            <button className="comm-write-btn" onClick={() => navigate('/community/write')}>
                글쓰기
            </button>
        </div>

        {/* 게시판 리스트 테이블 */}
        <table className="comm-table">
            <thead>
                <tr>
                    <th style={{width:'8%'}}>번호</th>
                    <th style={{width:'12%'}}>직군</th>
                    <th style={{width:'40%'}}>제목</th>
                    <th style={{width:'15%'}}>글쓴이</th>
                    <th style={{width:'10%'}}>작성일</th>
                    <th style={{width:'7%'}}>조회</th>
                    <th style={{width:'7%'}}>추천</th>
                </tr>
            </thead>
            <tbody>
                {posts.length === 0 ? (
                    <tr>
                        <td colSpan="7" style={{padding:'50px', textAlign:'center', color:'#999'}}>
                            등록된 게시글이 없습니다.
                        </td>
                    </tr>
                ) : (
                    posts.map((post) => (
                        <tr key={post.id}>
                            {/* 글 번호 */}
                            <td>{post.id}</td>
                            
                            {/* 직군 (여러 개일 경우 첫 번째만 표시) */}
                            <td>
                                {post.authorJob ? post.authorJob.split(',')[0] : '미설정'}
                            </td>
                            
                            {/* 제목 (클릭 시 상세페이지 이동) */}
                            <td className="text-left">
                                <span 
                                    className="comm-post-title" 
                                    onClick={() => navigate(`/community/${post.id}`)}
                                >
                                    {post.title}
                                </span>
                                {/* 댓글 수 표시 */}
                                <span className="comment-cnt">
                                    [{post.commentCount}]
                                </span>
                            </td>
                            
                            {/* 글쓴이 및 연차 */}
                            <td className="author-info">
                                {post.authorName} 
                                <span style={{fontSize:'12px', color:'#888', marginLeft:'4px'}}>
                                    ({post.authorCareer || '경력미상'})
                                </span>
                            </td>
                            
                            {/* 작성일 (YYYY-MM-DD만 표시) */}
                            <td>{post.createdAt}</td>
                            
                            {/* 조회수 */}
                            <td>{post.viewCount}</td>
                            
                            {/* 추천수 */}
                            <td>{post.likeCount}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommunityMain;