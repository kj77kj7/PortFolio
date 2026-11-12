import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CompanyList.css';

const CompanyList = () => {
  const navigate = useNavigate();
  
  // [기능 1] 상태 관리 (Auth, Data, Search)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const [allCompanies, setAllCompanies] = useState([]);      
  const [displayCompanies, setDisplayCompanies] = useState([]); 

  const [searchTags, setSearchTags] = useState([]); 
  const [inputValue, setInputValue] = useState(''); 

  // [기능 1] 초기 데이터 로드 및 로그인 체크
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        setIsLoggedIn(true);
        setUserName(user.name);
    }

    fetch('http://localhost:8080/api/users/companies')
      .then(res => res.json())
      .then(data => {
        // [기능 1] 최신순 정렬
        const sorted = data.sort((a, b) => b.id - a.id);
        setAllCompanies(sorted);
        setDisplayCompanies(sorted);
      })
      .catch(err => console.error(err));
  }, []);

  // [기능 1] 필터링 로직 (태그 AND 조건 + 텍스트 검색)
  useEffect(() => {
    let filtered = allCompanies;

    // 1. 태그(#) 조건 (AND 조건: 모든 태그를 포함해야 함)
    if (searchTags.length > 0) {
        filtered = filtered.filter(comp => 
            searchTags.every(tag => comp.tags && comp.tags.includes(tag))
        );
    }

    // 2. 텍스트 검색 (이름, 주소, 태그 문자열 포함 여부)
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

  // [기능 1] 로그아웃 핸들러
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  // [기능 1] 엔터 키 핸들러 (태그 생성)
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

  // [기능 1] 태그 삭제 핸들러
  const removeTag = (tagToRemove) => {
    setSearchTags(searchTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="cl-container">
      {/* [디자인 2] 헤더 적용 */}
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
          <button className="nav-text-link active" style={{color:'#397EFF'}} onClick={() => navigate('/companies')}>회사정보</button>
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
      <main className="cl-content">
        
        {/* 타이틀 영역 */}
        <div className="cl-header-box">
            <h1 className="cl-title">회사정보</h1>
        </div>

        {/* 검색 컨테이너 (태그 + 인풋) */}
        <div className="cl-search-container">
            <div className="cl-tag-box">
                {/* 선택된 태그 표시 */}
                {searchTags.map((tag, idx) => (
                    <div key={idx} className="cl-search-chip">
                        <span>{tag}</span>
                        <button onClick={() => removeTag(tag)}>×</button>
                    </div>
                ))}

                {/* [디자인 2] onFocus/onBlur 플레이스홀더 효과 적용 */}
                <input 
                    type="text" 
                    className="cl-tag-input"
                    placeholder="기업명, 지역 또는 #태그 입력"
                    onFocus={(e) => e.target.placeholder = ''} 
                    onBlur={(e) => e.target.placeholder = '기업명, 지역 또는 #태그 입력'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            
            <button className="cl-search-btn">
                <img 
                    src="img/search.png" 
                    alt="검색" 
                    className="search-icon-img"
                    onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='🔍';}}
                />
            </button>
        </div>

        {/* 회사 목록 그리드 */}
        <div className="cl-grid">
            {displayCompanies.length > 0 ? (
                displayCompanies.map(comp => (
                    <div 
                        key={comp.id} 
                        className="cl-card"
                        onClick={() => navigate(`/company-detail/${comp.id}`)}
                    >
                        {/* [기능 1 + 디자인 2] 데이터가 있으면 배경 이미지로 설정 */}
                        <div 
                            className="cl-card-img" 
                            style={comp.profileImage ? {backgroundImage:`url(${comp.profileImage})`, backgroundSize:'cover'} : {}}
                        ></div>
                        
                        <div className="cl-info">
                            <h3 className="cl-card-name">[ {comp.name} ]</h3>
                            <p className="cl-card-addr">{comp.address}</p>
                        </div>
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
    </div>
  );
};

export default CompanyList;