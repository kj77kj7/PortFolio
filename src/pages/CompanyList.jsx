import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CompanyList.css';

const CompanyList = () => {
  const navigate = useNavigate();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // 데이터 상태
  const [allCompanies, setAllCompanies] = useState([]);      
  const [displayCompanies, setDisplayCompanies] = useState([]); 

  // 검색 상태
  const [searchTags, setSearchTags] = useState([]); // #태그 배열
  const [inputValue, setInputValue] = useState(''); // 검색어

  const [hoveredCompany, setHoveredCompany] = useState(null);

  useEffect(() => {
    // 1. 로그인 체크
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        setIsLoggedIn(true);
        setUserName(user.name);
    }

    // 2. 회사 목록 Fetch
    fetch('http://localhost:8080/api/users/companies')
      .then(res => res.json())
      .then(data => {
        // 최신순 정렬
        const sorted = data.sort((a, b) => b.id - a.id);
        setAllCompanies(sorted);
        setDisplayCompanies(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  // 필터링 로직
  useEffect(() => {
    let filtered = allCompanies;

    // 1. 태그(#) 조건 (AND 조건)
    if (searchTags.length > 0) {
        filtered = filtered.filter(comp => 
            searchTags.every(tag => comp.tags && comp.tags.includes(tag))
        );
    }

    // 2. 텍스트 검색
    if (inputValue.trim()) {
        const keyword = inputValue.trim();
        filtered = filtered.filter(comp => 
            comp.name.includes(keyword) || 
            (comp.address && comp.address.includes(keyword)) ||
            (comp.tags && comp.tags.includes(keyword))
        );
    }

    setDisplayCompanies(filtered);
  }, [searchTags, inputValue, allCompanies]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  // 엔터 키 핸들러 (태그 생성)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const val = inputValue.trim();
        if (!val) return;

        // '#'으로 시작하면 태그로 변환
        if (val.startsWith('#')) {
            if (!searchTags.includes(val)) {
                setSearchTags([...searchTags, val]);
            }
            setInputValue(''); 
        }
    }
  };

  const removeTag = (tagToRemove) => {
    setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="cl-container">
      {/* [수정] 헤더 통일: 높이, 패딩, 간격(50px)을 다른 페이지와 똑같이 맞춤 */}
      <header className="navbar" style={{height:'80px', padding:'0 50px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', backgroundColor:'white'}}>
        <div className="logo-area">
          <h1 className="nav-logo" onClick={() => navigate('/')} style={{color:'#2E7D32', fontSize:'26px', fontWeight:'bold', cursor:'pointer', margin:0}}>
            커리어친구들
          </h1>
        </div>
        
        {/* [수정] 네비게이션 간격 50px, 회사정보 색상 초록색(#2E7D32) 적용 */}
        <nav className="nav-links" style={{display:'flex', gap:'50px', fontSize:'18px', fontWeight:'bold'}}>
          <span onClick={() => navigate('/jobs')} style={{color:'#333', cursor:'pointer'}}>구인구직</span>
          <span onClick={() => navigate('/companies')} style={{color:'#2E7D32', cursor:'pointer'}}>회사정보</span>
          <span onClick={() => navigate('/community')} style={{color:'#333', cursor:'pointer'}}>커뮤니티</span>
        </nav>
        
        <div className="auth-btn-area">
          {isLoggedIn ? (
             <>
               <button className="nav-btn" onClick={() => navigate('/mypage')} style={{padding:'8px 20px', borderRadius:'4px', border:'1px solid #ddd', backgroundColor:'white', color:'#4285F4', fontWeight:'bold', cursor:'pointer', marginRight:'10px'}}>
                 마이페이지 ({userName})
               </button>
               <button className="nav-btn logout-btn" onClick={handleLogout} style={{padding:'8px 20px', borderRadius:'4px', border:'1px solid #ddd', backgroundColor:'white', color:'#4285F4', fontWeight:'bold', cursor:'pointer'}}>
                 로그아웃
               </button>
             </>
          ) : (
             <button className="nav-btn" onClick={() => navigate('/login')} style={{padding:'8px 20px', borderRadius:'4px', border:'1px solid #ddd', backgroundColor:'white', color:'#4285F4', fontWeight:'bold', cursor:'pointer'}}>
               회원가입 / 로그인
             </button>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="cl-content">
        <div className="cl-header-box">
            <h1 className="cl-title">회사정보</h1>
            <div className="cl-underline"></div>
        </div>

        {/* 검색 컨테이너 */}
        <div className="cl-search-container">
            <div className="cl-tag-box">
                {searchTags.map((tag, idx) => (
                    <div key={idx} className="cl-search-chip">
                        <span>{tag}</span>
                        <button onClick={() => removeTag(tag)}>×</button>
                    </div>
                ))}
                <input 
                    type="text" 
                    className="cl-tag-input"
                    placeholder="기업명, 지역 또는 #태그 입력"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <button className="cl-search-btn">🔍</button>
        </div>

        {/* 회사 그리드 */}
        <div className="cl-grid">
            {displayCompanies.length > 0 ? (
                displayCompanies.map(comp => (
                    <div 
                        key={comp.id} 
                        className="cl-card"
                        onClick={() => navigate(`/company-detail/${comp.id}`)}
                        onMouseEnter={() => setHoveredCompany(comp)}
                        onMouseLeave={() => setHoveredCompany(null)}
                    >
                        {/* 로고 이미지가 있다면 배경으로, 없으면 회색 */}
                        <div className="cl-card-img" style={comp.profileImage ? {backgroundImage:`url(${comp.profileImage})`, backgroundSize:'cover'} : {}}></div>
                        <h3 className="cl-card-name">[ {comp.name} ]</h3>
                        <p className="cl-card-addr">{comp.address}</p>
                    </div>
                ))
            ) : (
                <div className="no-result-msg">
                    검색 결과가 없습니다.<br/>
                    <span style={{fontSize:'14px', fontWeight:'normal'}}>다른 키워드로 검색해보세요.</span>
                </div>
            )}
        </div>

        <div className="cl-footer">
            커리어 친구들에 등록된 회사의 정보만 나타날 수 있습니다.
        </div>
      </main>

      {/* 팝업 */}
      {hoveredCompany && (
        <div className="cl-popup-overlay">
            <div className="cl-popup-box">
                <div className="cl-popup-img" style={hoveredCompany.profileImage ? {backgroundImage:`url(${hoveredCompany.profileImage})`, backgroundSize:'cover'} : {}}></div>
                <h2 className="cl-popup-name">[ {hoveredCompany.name} ]</h2>
                <p className="cl-popup-addr">{hoveredCompany.address}</p>
                <div className="cl-popup-tags">
                    {hoveredCompany.tags ? hoveredCompany.tags : '#태그정보없음'}
                </div>
                <div className="cl-popup-intro">
                    {hoveredCompany.career ? hoveredCompany.career : '회사 소개가 없습니다.'}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CompanyList;