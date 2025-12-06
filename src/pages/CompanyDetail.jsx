import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/CompanyDetail.css';

const CompanyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // 1. 로그인 체크
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.name);
    }

    // 2. 회사 정보 Fetch
    fetch(`http://localhost:8080/api/users/${id}`)
      .then(res => res.json())
      .then(data => setCompany(data))
      .catch(err => console.error(err));
  }, [id]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  if (!company) return <div style={{padding:'50px', textAlign:'center'}}>로딩중...</div>;

  return (
    <div className="cd-container">
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
      <main className="cd-content">
        
        <h1 className="cd-page-title">회사정보</h1>
        <div className="cd-title-underline"></div>

        {/* 검색창 */}
        <div className="cd-search-wrapper">
           <input type="text" className="cd-search-input" placeholder="" />
        </div>

        {/* 상세 정보 카드 */}
        <div className="cd-grid" style={{gridTemplateColumns: '1fr'}}> 
          <div className="cd-card" style={{alignItems: 'center', textAlign: 'center'}}>
            <div className="gray-panel cd-panel" style={{maxWidth: '600px'}}></div>
            <div className="cd-info" style={{marginTop: '20px', width: '100%', maxWidth: '800px'}}>
              <h3 style={{fontSize: '32px', marginBottom: '20px'}}>[ {company.name} ]</h3>
              
              <div style={{textAlign: 'left', display:'inline-block', marginBottom:'30px'}}>
                  <p style={{fontSize: '18px', margin: '10px 0'}}><strong>📍 주소:</strong> {company.address}</p>
                  <p style={{fontSize: '18px', margin: '10px 0'}}><strong>🏢 사업자번호:</strong> {company.businessNumber}</p>
                  <p style={{fontSize: '18px', margin: '10px 0'}}><strong>💻 대표 채용분야:</strong> {company.jobGroup}</p>
              </div>

              <div style={{marginTop: '10px', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '12px', width:'100%', boxSizing:'border-box', textAlign:'left'}}>
                  <h4 style={{fontSize:'20px', marginBottom:'10px'}}>기업 소개</h4>
                  <p style={{lineHeight: '1.8', fontSize:'16px', whiteSpace: 'pre-line'}}>{company.career}</p>
              </div>
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