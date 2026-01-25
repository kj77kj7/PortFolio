import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/CompanyDetail.css';

const CompanyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // [기능 1] 상태 관리
  const [company, setCompany] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // [기능 1] 로그인 체크
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.name);
    }

    // [기능 1] 회사 정보 Fetch
    fetch(`http://localhost:8080/api/users/${id}`)
      .then(res => res.json())
      .then(data => setCompany(data))
      .catch(err => console.error(err));
  }, [id]);

  // [기능 1] 로그아웃 핸들러
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  if (!company) return <div style={{padding:'50px', textAlign:'center'}}>로딩중...</div>;

  return (
    <div className="cd-container">
      {/* [디자인 2] 헤더 적용 */}
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
          <button className="nav-text-link active" onClick={() => navigate('/companies')}>회사정보</button>
          <button className="nav-text-link" onClick={() => navigate('/community')}>커뮤니티</button>
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

      {/* [디자인 2] 메인 컨텐츠 구조 */}
      <main className="cd-content">
        
        {/* 뒤로가기 버튼 (왼쪽 정렬) */}
        <div className="back-link-area" onClick={() => navigate(-1)}>
          ← 취소하고 돌아가기
        </div>

        {/* 상세 정보 카드 (중앙 정렬) */}
        <div className="cd-detail-card">
            {/* 이미지 영역: 프로필 이미지가 있으면 보여주고, 없으면 회색 패널 */}
            <div 
                className="gray-panel cd-panel"
                style={company.profileImage ? {backgroundImage: `url(${company.profileImage})`, backgroundSize: 'cover'} : {}}
            ></div>
            
            <div className="cd-info-area">
              <h3 className="cd-company-name">[ {company.name} ]</h3>
              
              <div className="cd-meta-info">
                  <p><strong>📍 주소:</strong> {company.address}</p>
                  <p><strong>🏢 사업자번호:</strong> {company.businessNumber}</p>
                  <p><strong>💻 대표 채용분야:</strong> {company.jobGroup}</p>
              </div>

              <div className="cd-intro-box">
                  <h4>기업 소개</h4>
                  {/* [기능 1] 줄바꿈 문자 처리 등을 위해 style 추가 가능 */}
                  <p style={{whiteSpace: 'pre-line'}}>{company.career}</p>
              </div>
            </div>
        </div>
        
        <div className="cd-footer-text">
            커리어 친구들에 등록된 회사의 정보만 나타날 수 있습니다.
        </div>

      </main>
    </div>
  );
};

export default CompanyDetail;