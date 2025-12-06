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
  const [searchTags, setSearchTags] = useState([]); // #태그만 저장되는 배열
  const [inputValue, setInputValue] = useState(''); // 일반 검색어(텍스트)

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
        // 최신순 정렬 (ID 역순)
        const sorted = data.sort((a, b) => b.id - a.id);
        setAllCompanies(sorted);
        setDisplayCompanies(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  // [수정] 필터링 로직
  useEffect(() => {
    let filtered = allCompanies;

    // 1. 태그(#) 조건 필터링 (모두 포함해야 함: AND)
    if (searchTags.length > 0) {
        filtered = filtered.filter(comp => 
            searchTags.every(tag => comp.tags && comp.tags.includes(tag))
        );
    }

    // 2. 일반 텍스트 검색 (이름, 주소, 태그 텍스트 포함 여부)
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

  // [수정] 엔터 키 핸들러
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        // 폼 제출 방지 (혹시 모를 리로드 방지)
        e.preventDefault();
        
        const val = inputValue.trim();
        if (!val) return;

        // [중요] '#'으로 시작하는 경우만 태그(Chip)로 변환
        if (val.startsWith('#')) {
            // 중복 방지
            if (!searchTags.includes(val)) {
                setSearchTags([...searchTags, val]);
            }
            setInputValue(''); // 태그로 들어갔으니 입력창 비움
        } else {
            // '#'이 없으면 그냥 텍스트 상태 유지 (태그로 변환 안 함)
            // useEffect가 inputValue 변화를 감지해 이미 필터링 중임
        }
    }
  };

  // 태그 삭제
  const removeTag = (tagToRemove) => {
    setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="cl-container">
      <header className="navbar">
        <div className="logo-area">
          <h1 className="nav-logo" onClick={() => navigate('/')}>커리어친구들</h1>
        </div>
        <nav className="nav-links">
          <span onClick={() => navigate('/jobs')}>구인구직</span>
          <span style={{color: 'black', fontWeight:'bold'}}>회사정보</span>
          <span onClick={() => navigate('/')}>커뮤니티</span>
        </nav>
        <div className="auth-btn-area">
          {isLoggedIn ? (
             <>
               <button className="nav-btn" onClick={() => navigate('/mypage')}>마이페이지 ({userName})</button>
               <button className="nav-btn logout-btn" onClick={handleLogout}>로그아웃</button>
             </>
          ) : (
             <button className="nav-btn" onClick={() => navigate('/login')}>회원가입 / 로그인</button>
          )}
        </div>
      </header>
      <div className="nav-divider"></div>

      <main className="cl-content">
        <div className="cl-header-box">
            <h1 className="cl-title">회사정보</h1>
            <div className="cl-underline"></div>
        </div>

        {/* 검색 컨테이너 */}
        <div className="cl-search-container">
            <div className="cl-tag-box">
                {/* #태그 칩들만 여기에 표시됨 */}
                {searchTags.map((tag, idx) => (
                    <div key={idx} className="cl-search-chip">
                        <span>{tag}</span>
                        <button onClick={() => removeTag(tag)}>×</button>
                    </div>
                ))}

                {/* 입력창 */}
                <input 
                    type="text" 
                    className="cl-tag-input"
                    placeholder="기업명, 지역 또는 #태그 입력"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            {/* 돋보기 아이콘 (클릭 시 별도 동작 없어도 됨, 실시간/엔터 검색 지원) */}
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
                        <div className="cl-card-img"></div>
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
                <div className="cl-popup-img"></div>
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