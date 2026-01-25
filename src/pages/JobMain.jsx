import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/JobMain.css';

// [디자인 2] 검색 문구 배열
const SEARCH_PHRASES = [
  "관심있는 공고를 검색해보세요",
  "나에게 딱 맞는 공고를 찾아보세요",
  "내 전공을 살릴 수 있는 공고는?",
];

const JobMain = () => {
  const navigate = useNavigate();
  
  // [기능 1] 상태 관리 (로직 유지)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  
  const [jobPosts, setJobPosts] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 
  
  // [디자인 2] 랜덤 플레이스홀더 상태
  const [placeholderText, setPlaceholderText] = useState(SEARCH_PHRASES[0]);

  useEffect(() => {
    // [디자인 2] 랜덤 문구 설정
    setPlaceholderText(SEARCH_PHRASES[Math.floor(Math.random() * SEARCH_PHRASES.length)]);
    
    // [기능 1] 유저 세션 확인 및 권한 설정
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.name);
      if (user.role === 'COMPANY') {
        setIsCompany(true);
      }
    }
    
    // [기능 1] 초기 데이터 로드
    fetchJobs();
  }, []);

  // [기능 1] 검색 및 데이터 Fetch 함수
  const fetchJobs = (keyword = '') => {
    let url = 'http://localhost:8080/api/jobs';
    if (keyword) {
      url += `?search=${keyword}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // [기능 1] 최신순 정렬 유지
        const sortedData = data.sort((a, b) => b.id - a.id);
        setJobPosts(sortedData);
      })
      .catch(err => console.error(err));
  };

  // [기능 1] 검색 핸들러
  const handleSearch = () => {
    fetchJobs(searchTerm);
    setCurrentPage(1); // 검색 시 1페이지로 초기화
  };

  // [기능 1] 로그아웃 핸들러
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    setIsCompany(false);
    navigate(0); // 새로고침
  };

  // [기능 1] 페이지네이션 계산 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = jobPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(jobPosts.length / itemsPerPage);

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  // [기능 1] 썸네일 추출 헬퍼 함수
  const getThumbnail = (jsonImages) => {
      try {
          const parsed = JSON.parse(jsonImages);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) { return null; }
      return null;
  };

  return (
    <div className="job-main-container">
      {/* [디자인 2] 헤더 스타일 적용 */}
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
             <button className="nav-text-link active" style={{color:'#397EFF'}} onClick={() => navigate('/jobs')}>구인구직</button>
             <button className="nav-text-link" onClick={() => navigate('/companies')}>회사정보</button>
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

      <div className="jm-content">
        {/* [디자인 2] 타이틀 영역 및 글 작성 버튼 */}
        <div className="jm-title-row">
            <h2 className="section-title">구인구직</h2>
            {/* [기능 1] 기업 회원일 때만 글 작성 버튼 표시 */}
            {isCompany && (
                <button className="write-post-btn" onClick={() => navigate('/jobs/create')}>
                    글 작성
                </button>
            )}
        </div>

        {/* [디자인 2] 검색창 디자인 (타이틀 아래 위치) */}
        <div className="jm-search-banner">
            <input 
                type="text" 
                className="jm-search-input"
                placeholder={placeholderText}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="jm-search-btn" onClick={handleSearch}>
                <img 
                    src="img/search.png" 
                    alt="검색" 
                    className="search-icon-img"
                    onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='🔍';}}
                />
            </button>
        </div>

        {/* [디자인 2] 리스트 래퍼 및 페이지네이션 버튼 */}
        <div className="jm-list-wrapper">
            {/* [기능 1] 이전 페이지 버튼 */}
            <button className="page-arrow-btn" onClick={handlePrevPage} disabled={currentPage === 1}>&lt;</button>
            
            <div className="jm-grid">
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => {
                        const thumbnail = getThumbnail(post.jobImages);
                        return (
                            <div key={post.id} className="job-card" onClick={() => navigate(`/job-detail/${post.id}`)}>
                                {thumbnail ? (
                                    <div className="image-placeholder" style={{backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                                ) : (
                                    <div className="image-placeholder"></div>
                                )}
                                <div className="job-info">
                                    <h3>[ {post.title} ]</h3>
                                    <p style={{fontSize:'12px', color:'#999', marginBottom:'5px'}}>
                                        {post.startDate} ~ {post.endDate}
                                    </p>
                                    <p style={{fontSize:'14px',fontWeight:'bold', color:'#333', marginBottom:'2px'}}>
                                        {post.companyName}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-data">등록된 공고가 없습니다.</div>
                )}
            </div>

            {/* [기능 1] 다음 페이지 버튼 */}
            <button className="page-arrow-btn" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default JobMain;