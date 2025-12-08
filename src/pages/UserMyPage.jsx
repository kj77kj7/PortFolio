import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserMyPage.css';

const UserMyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  
  // 게시글 관련 상태
  const [myPosts, setMyPosts] = useState([]); // 전체 게시글
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const postsPerPage = 5; // 한 페이지당 보여줄 게시글 수

  useEffect(() => {
    // 1. 유저 정보 로드
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    setUser(storedUser);

    // 2. 서버에서 최신 유저 정보 갱신
    fetch(`http://localhost:8080/api/users/${storedUser.id}`)
      .then(res => res.json())
      .then(data => {
          setUser(data);
          sessionStorage.setItem('user', JSON.stringify(data));
      })
      .catch(err => console.error("유저 정보 갱신 실패:", err));

    // 3. 지원 내역 가져오기
    fetch(`http://localhost:8080/api/applications/user/${storedUser.id}`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => b.id - a.id);
        setApplications(sorted);
      })
      .catch(err => console.error(err));

    // 4. [추가] 내가 쓴 게시글 목록 가져오기
    fetch(`http://localhost:8080/api/community/user/${storedUser.id}`)
      .then(res => res.json())
      .then(data => {
          // data는 이미 컨트롤러에서 최신순 정렬되어 옴
          setMyPosts(data);
      })
      .catch(err => console.error("게시글 로드 실패:", err));

  }, [navigate]);

  // 지원 철회 핸들러
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

  const renderStatusBadge = (status) => {
    let text = "";
    let className = "status-badge";
    if (status === "APPLIED") {
      text = "미정";
      className += " pending";
    } else if (status === "PASSED") {
      text = "합격";
      className += " passed";
    } else if (status === "FAILED") {
      text = "불합격";
      className += " failed";
    }
    return <span className={className}>{text}</span>;
  };

  const getThumbnail = (jsonImages) => {
    try {
      const parsed = JSON.parse(jsonImages);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch { return null; }
  };

  // --- 페이지네이션 계산 로직 ---
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

  if (!user) return <div>Loading...</div>;

  return (
    <div className="ump-container">
      <header className="navbar">
        <h1 className="nav-logo" onClick={() => navigate('/')}>커리어친구들</h1>
        <nav className="nav-links">
             <span onClick={() => navigate('/jobs')}>구인구직</span>
             <span onClick={() => navigate('/companies')}>회사정보</span>
             <span onClick={() => navigate('/community')}>커뮤니티</span>
        </nav>
        <div className="auth-btn-area">
             <button className="nav-btn logout-btn" onClick={() => {
                 sessionStorage.removeItem('user');
                 navigate('/');
             }}>로그아웃</button>
        </div>
      </header>
      
      <div className="nav-divider"></div>
      <div className="back-link" onClick={() => navigate('/')}>← 취소하고 돌아가기</div>

      <div className="ump-content">
        <h1 className="ump-title">프로필</h1>
        <div className="ump-divider"></div>

        <div className="ump-profile-section">
            <div className="ump-avatar" style={{overflow:'hidden', display:'flex', justifyContent:'center', alignItems:'center'}}>
                {user.profileImage ? (
                    <img 
                        src={user.profileImage} 
                        alt="프로필" 
                        style={{width:'100%', height:'100%', objectFit:'cover'}} 
                    />
                ) : (
                    <div style={{width:'100%', height:'100%', backgroundColor:'#d9d9d9'}}></div>
                )}
            </div>
            
            <div className="ump-user-info">
                <h2>{user.name}</h2>
                <p>{user.jobGroup || '직군 미설정'}</p>
                <p>{user.career || '경력 미설정'}</p>
            </div>
        </div>

        <div className="ump-resume-banner" onClick={() => navigate('/resumes/create')}>
            <div className="icon-circle">👤</div>
            <div className="banner-text">
                <h3>이력서 작성하기</h3>
                <p>당신의 이야기를 들려주세요!</p>
            </div>
            <div className="arrow-icon">➜</div>
        </div>

        <div className="ump-section">
            <h3 className="section-label">구직활동</h3>
            <div className="ump-app-list">
                {applications.length > 0 ? (
                    applications.map(app => {
                        const thumb = getThumbnail(app.jobImages);
                        return (
                            <div key={app.id} className="ump-app-card" onClick={() => navigate(`/job-detail/${app.jobPostId}`)}>
                                <div className="ump-card-img">
                                    {thumb ? <img src={thumb} alt="job" /> : <div className="gray-box-md"></div>}
                                </div>
                                <div className="ump-card-info">
                                    <h4>{app.jobTitle}</h4>
                                    <p className="company-name">{app.companyName}</p>
                                    <p className="company-addr">{app.companyAddress}</p>
                                    <p className="career-tag">{app.career}</p>
                                </div>
                                <div className="ump-card-action">
                                    {renderStatusBadge(app.status)}
                                    {app.status === "APPLIED" && (
                                        <button 
                                            className="withdraw-btn" 
                                            onClick={(e) => handleWithdraw(e, app.id)}
                                        >
                                            지원철회
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="no-data-msg">지원한 내역이 없습니다.</div>
                )}
            </div>
        </div>

        <div className="ump-section">
            <h3 className="section-label">게시글</h3>
            <div className="ump-post-list-wrapper">
                {currentPosts.length > 0 ? (
                    <>
                        <div className="ump-post-list">
                            {currentPosts.map(post => (
                                <div 
                                    key={post.id} 
                                    className="ump-post-row" 
                                    onClick={() => navigate(`/community/${post.id}`)}
                                >
                                    <span className="ump-post-title-text">{post.title}</span>
                                    <span className="ump-post-date">{post.createdAt}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* 페이지네이션 컨트롤 */}
                        {totalPages > 1 && (
                            <div className="ump-pagination">
                                <button 
                                    onClick={handlePrevPage} 
                                    disabled={currentPage === 1}
                                    className="ump-page-btn"
                                >
                                    &lt;
                                </button>
                                <span className="ump-page-info">{currentPage} / {totalPages}</span>
                                <button 
                                    onClick={handleNextPage} 
                                    disabled={currentPage === totalPages}
                                    className="ump-page-btn"
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="no-data-text">아직 게시 된 글이 없어요</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default UserMyPage;