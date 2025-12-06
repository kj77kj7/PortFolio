import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/JobPostDetail.css';

const JobPostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // URL 파라미터 ID
  const [jobData, setJobData] = useState(null);
  
  // 네비게이션용 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // 1. 로그인 상태 확인
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.name);
    }

    // 2. 상세 데이터 Fetch
    fetch(`http://localhost:8080/api/users/${id}`)
      .then(res => res.json())
      .then(data => setJobData(data))
      .catch(err => console.error(err));
  }, [id]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  if (!jobData) return <div style={{padding:'50px', textAlign:'center'}}>로딩중...</div>;

  return (
    <div className="jd-container">
      {/* 네비게이션 바 */}
      <header className="navbar">
        <div className="logo-area">
          <h1 className="nav-logo" onClick={() => navigate('/')}>커리어친구들</h1>
        </div>
        <nav className="nav-links">
          <span onClick={() => navigate('/')}>구인구직</span>
          <span onClick={() => navigate('/')}>회사정보</span>
          <span onClick={() => navigate('/')}>커뮤니티</span>
        </nav>
        <div className="auth-btn-area">
          {isLoggedIn ? (
            <>
              <button className="nav-btn" onClick={() => navigate('/mypage')}>
                마이페이지 ({userName})
              </button>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <button className="nav-btn" onClick={() => navigate('/login')}>
              회원가입 / 로그인
            </button>
          )}
        </div>
      </header>
      <div className="nav-divider"></div>

      {/* 메인 컨텐츠 */}
      <main className="jd-content">
        
        {/* 뒤로가기 */}
        <div className="back-link-area" onClick={() => navigate(-1)}>
          ← 취소하고 돌아가기
        </div>

        {/* 상단 이미지 영역 */}
        <div className="jd-images-row">
          <div className="gray-panel jd-main-img"></div>
          <div className="gray-panel jd-sub-img"></div>
        </div>

        {/* 헤더 정보 */}
        <div className="jd-header-info">
          <div className="jd-text-info">
            <h1 className="jd-title">{jobData.jobGroup}</h1>
            <p className="jd-subtitle">
              <span className="bold-text">{jobData.name}</span> 
              {jobData.address}
            </p>
          </div>
          <div className="jd-action">
            <button className="apply-btn">지원하기</button>
          </div>
        </div>

        <div className="divider"></div>

        {/* 상세 내용 */}
        <section className="jd-section">
          <h3 className="jd-section-title">포지션 상세 및 기업 소개</h3>
          <div className="jd-description">
            <p style={{fontSize: '18px', lineHeight: '1.8', whiteSpace: 'pre-line'}}>
              {jobData.career}
            </p>
            <br />
            <p style={{fontSize: '16px', color:'#555'}}>
                <strong>[담당 업무 및 자격 요건]</strong><br/>
                상세 업무 내용은 면접 시 자세히 안내해 드립니다.
            </p>
          </div>
        </section>

        {/* 태그 */}
        <section className="jd-section">
          <h3 className="jd-section-title">태그</h3>
          <div className="jd-tags">
            <span>#경력무관</span>
            <span>#4대보험</span>
            <span>#자유복장</span>
            <span>#연차사용</span>
          </div>
        </section>

      </main>
    </div>
  );
};

export default JobPostDetail;