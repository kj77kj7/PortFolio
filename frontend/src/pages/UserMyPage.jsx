import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserMyPage.css';

const UserMyPage = () => {
  const navigate = useNavigate();
  
  // [로직] 상태 관리 (UserMyPage.jsx 원본 로직 유지)
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  
  // [로직] 게시글 관련 상태
  const [myPosts, setMyPosts] = useState([]); // 전체 게시글
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const postsPerPage = 5; // 한 페이지당 보여줄 게시글 수

  useEffect(() => {
    // [로직] 1. 유저 정보 로드
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    setUser(storedUser);

    // [로직] 2. 서버에서 최신 유저 정보 갱신
    fetch(`http://localhost:8080/api/users/${storedUser.id}`)
      .then(res => res.json())
      .then(data => {
          setUser(data);
          sessionStorage.setItem('user', JSON.stringify(data));
      })
      .catch(err => console.error("유저 정보 갱신 실패:", err));

    // [로직] 3. 지원 내역 가져오기
    fetch(`http://localhost:8080/api/applications/user/${storedUser.id}`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => b.id - a.id);
        setApplications(sorted);
      })
      .catch(err => console.error(err));

    // [로직] 4. 내가 쓴 게시글 목록 가져오기
    fetch(`http://localhost:8080/api/community/user/${storedUser.id}`)
      .then(res => res.json())
      .then(data => {
          setMyPosts(data);
      })
      .catch(err => console.error("게시글 로드 실패:", err));

  }, [navigate]);

  // [로직] 지원 철회 핸들러
  const handleWithdraw = (e, appId) => {
    e.stopPropagation(); 
    if (!window.confirm("정말로 지원을 철회하시겠습니까?")) return;

    fetch(`http://localhost:8080/api/applications/${appId}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (res.ok) {
        alert("지원이 철회되었습니다.");
        setApplications(prev => prev.filter(app => app.id !== appId));
      } else {
        res.text().then(msg => alert(msg));
      }
    })
    .catch(err => console.error(err));
  };

  // [로직] 로그아웃 핸들러
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/');
  };

  // [로직] 페이지네이션 계산 로직
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = myPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(myPosts.length / postsPerPage);

  const handlePrevPage = () => {
      if(currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
      if(currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (!user) return <div style={{padding:'50px', textAlign:'center'}}>로딩중...</div>;

  return (
    <div className="mp-container">
      {/* [디자인] 상단바 (UserMyPage1.jsx 스타일) */}
      <header className="navbar">
        <div className="logo-area" onClick={() => navigate('/')}>
            <img 
                src="img/logo.png" 
                alt="커리어친구들" 
                className="nav-logo-img"
                onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='커리어친구들';}} 
            />
        </div>
        
        <nav className="nav-links">
          <button className="nav-text-link" onClick={() => navigate('/jobs')}>구인구직</button>
          <button className="nav-text-link" onClick={() => navigate('/companies')}>회사정보</button>
          <button className="nav-text-link" onClick={() => navigate('/community')}>커뮤니티</button>
        </nav>

        <div className="auth-area">
          <div style={{display:'flex', gap:'10px'}}>
             <button className="login-box-btn active" onClick={() => navigate('/mypage')}>
               {user.name}님
             </button>
             <button className="login-box-btn" onClick={handleLogout} style={{width:'100px', color:'#333'}}>
               로그아웃
             </button>
          </div>
        </div>
      </header>
      
      {/* [디자인] 메인 콘텐츠 래퍼 */}
      <div className="mp-content">
          
          {/* [디자인] 취소하고 돌아가기 */}
          <div className="mp-back-link" onClick={() => navigate(-1)}>
            ← 취소하고 돌아가기
          </div>

          {/* [디자인] 마이페이지 헤더 영역 */}
          <div className="mp-header-box">
             <h1 className="mp-title">마이페이지</h1>
          </div>

          {/* [디자인] 1. 프로필 & 이력서 관리 카드 */}
          <div className="mp-profile-card">
              <div className="mp-profile-left">
                  <div className="mp-profile-img">
                      {user.profileImage ? (
                          <img src={user.profileImage} alt="Profile" />
                      ) : (
                          <div className="no-profile-img" style={{
                              width:'100%', height:'100%', display:'flex', 
                              justifyContent:'center', alignItems:'center', 
                              backgroundColor:'#e0e0e0', color:'#999', fontSize:'12px',
                              borderRadius: '50%', objectFit: 'cover'
                            }}>
                              No Image
                          </div>
                      )}
                  </div>
              </div>

              <div className="mp-profile-info">
                  <div className="mp-info-row">
                      <span className="mp-label">이름</span>
                      <span className="mp-value">{user.name}</span>
                  </div>
                  <div className="mp-info-row">
                      <span className="mp-label">경력</span>
                      <span className="mp-value">{user.career || '경력 미설정'}</span>
                      <span className="mp-badge">{user.jobGroup ? user.jobGroup.split(',')[0] : '미지정'}</span>
                  </div>
                  <div className="mp-info-row">
                      <span className="mp-label">이메일</span>
                      <span className="mp-value">{user.email}</span>
                  </div>
                  
                  {/* [디자인] 이력서 등록/수정 버튼 */}
                  <div className="mp-info-row" style={{marginTop:'15px'}}>
                      <button 
                          className="mp-tag-add-btn" 
                          onClick={() => navigate('/resumes/create')} // [로직] 경로 유지
                          style={{width:'150px'}} 
                      >
                          {user.resumeId ? '이력서 수정하기' : '이력서 등록하기'}
                      </button>
                  </div>
              </div>
          </div>
          
          {/* [디자인] 2. 기능 섹션: 지원 내역과 작성 글 그리드 */}
          <div className="mp-grid-sections">
              
              {/* 2-1. 지원 내역 섹션 (왼쪽) */}
              <section className="mp-section mp-app-section">
                  <h3 className="mp-section-title">지원 내역 ({applications.length})</h3>
                  <div className="ump-application-list">
                    {applications.length > 0 ? (
                      // [로직] 데이터 매핑 키 유지 (app.jobTitle 등)
                      applications.slice(0, 4).map((app) => ( 
                        <div 
                            key={app.id} 
                            className="ump-app-row"
                            onClick={() => navigate(`/job-detail/${app.jobPostId}`)} 
                        >
                            <div className="ump-app-info">
                                <span className="ump-app-job-title">{app.jobTitle ? app.jobTitle.substring(0, 15) : '제목 없음'}...</span>
                                <span className="ump-app-company-name">({app.companyName})</span>
                            </div>
                            <div className="ump-app-actions">
                                {app.status === 'APPLIED' && (
                                    <button 
                                        className="ump-withdraw-btn"
                                        onClick={(e) => handleWithdraw(e, app.id)}
                                    >
                                        철회
                                    </button>
                                )}
                                {/* [디자인] 상태 뱃지 스타일 적용 */}
                                <span className={`ump-app-status status-${app.status ? app.status.toLowerCase() : 'applied'}`}> 
                                    {app.status === 'APPLIED' ? '검토중' : app.status === 'PASSED' ? '합격' : app.status === 'FAILED' ? '불합격' : '미정'}
                                </span>
                            </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-data-text no-data-box">아직 지원한 내역이 없어요</div>
                    )}
                  </div>
                  {/* 더보기 버튼 */}
                  {applications.length > 4 && (
                    <div className="section-more-btn" onClick={() => navigate('/jobs')}>+ 더보기</div>
                  )}
              </section>

              {/* 2-2. 작성 글 섹션 (오른쪽) */}
              <section className="mp-section mp-post-section">
                <h3 className="mp-section-title">작성 글 ({myPosts.length})</h3>
                <div className="ump-post-list-wrapper">
                  {currentPosts.length > 0 ? (
                      <div className="ump-post-list">
                          {currentPosts.map((post) => (
                              <div 
                                  key={post.id} 
                                  className="ump-post-row" 
                                  onClick={() => navigate(`/community/${post.id}`)}
                              >
                                  <span className="ump-post-title-text">{post.title.substring(0, 20)}{post.title.length > 20 ? '...' : ''}</span>
                                  <span className="ump-post-date">{post.createdAt ? post.createdAt.substring(5, 10) : '-'}</span>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="no-data-text no-data-box">아직 게시 된 글이 없어요</div>
                  )}
                </div>
                
                {/* [로직] 페이지네이션 컨트롤 (UserMyPage1 디자인에 로직 통합) */}
                {totalPages > 1 && (
                    <div style={{display:'flex', justifyContent:'center', alignItems:'center', marginTop:'15px', gap:'10px'}}>
                        <button 
                            onClick={handlePrevPage} 
                            disabled={currentPage === 1}
                            style={{border:'none', background:'transparent', cursor:'pointer', color:'#397EFF', fontWeight:'bold'}}
                        >
                            &lt;
                        </button>
                        <span style={{fontSize:'12px', color:'#666'}}>{currentPage} / {totalPages}</span>
                        <button 
                            onClick={handleNextPage} 
                            disabled={currentPage === totalPages}
                            style={{border:'none', background:'transparent', cursor:'pointer', color:'#397EFF', fontWeight:'bold'}}
                        >
                            &gt;
                        </button>
                    </div>
                )}
              </section>
          </div>

      </div>
    </div>
  );
};

export default UserMyPage;