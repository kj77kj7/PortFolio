import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

// [디자인] 랜덤 검색 문구 목록
const SEARCH_PHRASES = [
  "관심있는 기업이나 공고를 검색해보세요",
  "오늘은 무엇이 궁금하신가요?",
  "재택근무를 지원하는 회사는?",
  "내 전공을 살릴 수 있는 공고는?",
  "연봉 정보가 궁금하다면?"
];

const Home = () => {
  const navigate = useNavigate();
  
  // [로직] 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [companyData, setCompanyData] = useState([]); 
  const [combinedJobs, setCombinedJobs] = useState([]); 
  const [topPosts, setTopPosts] = useState([]);

  // [로직] 슬라이드 상태
  const [jobSlide, setJobSlide] = useState(0);        
  const [companySlide, setCompanySlide] = useState(0); 
  const ITEMS_PER_PAGE = 3; 

  // [디자인] 랜덤 플레이스홀더 상태
  const [placeholderText, setPlaceholderText] = useState(SEARCH_PHRASES[0]);

  useEffect(() => {
    // [디자인] 랜덤 문구 설정
    const randomPhrase = SEARCH_PHRASES[Math.floor(Math.random() * SEARCH_PHRASES.length)];
    setPlaceholderText(randomPhrase);

    // [로직] 로그인 상태 확인
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.name);
    }

    // [로직] 데이터 병렬 Fetch
    Promise.all([
      fetch('http://localhost:8080/api/users/companies').then(res => res.json()),
      fetch('http://localhost:8080/api/jobs').then(res => res.json()),
      fetch('http://localhost:8080/api/community/top').then(res => res.json())
    ])
    .then(([companies, jobs, topCommunity]) => {
      // 회사 정보 (최신순)
      const sortedCompanies = companies.sort((a, b) => b.id - a.id);
      setCompanyData(sortedCompanies);

      // 구인구직 통합 리스트
      const formattedCompanies = sortedCompanies.map(c => ({
        id: c.id,
        isRealJob: false,
        title: c.jobGroup,
        name: c.name,
        address: c.address,
        date: '상시 채용',
        image: c.profileImage // 여기에도 profileImage가 있으면 이미지가 나오도록 연동
      }));

      const formattedJobs = jobs.map(j => ({
        id: j.id,
        isRealJob: true,
        title: j.title,
        name: j.companyName,
        address: j.companyAddress,
        date: `${j.startDate} ~ ${j.endDate}`,
        image: j.jobImages ? JSON.parse(j.jobImages)[0] : null
      }));

      // 실제 공고 우선, 그 뒤에 기업 상시채용 정보
      setCombinedJobs([...formattedJobs, ...formattedCompanies]);
      
      // 인기글 설정
      setTopPosts(topCommunity);
    })
    .catch(err => console.error("데이터 로드 실패:", err));
  }, []);

  // [로직] 로그아웃 핸들러
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate(0); 
  };

  // [로직] 슬라이드 핸들러
  const handleJobPrev = () => { if (jobSlide > 0) setJobSlide(prev => prev - 1); };
  const handleJobNext = () => { if (jobSlide + ITEMS_PER_PAGE < combinedJobs.length) setJobSlide(prev => prev + 1); };

  const handleCompanyPrev = () => { if (companySlide > 0) setCompanySlide(prev => prev - 1); };
  const handleCompanyNext = () => { if (companySlide + ITEMS_PER_PAGE < companyData.length) setCompanySlide(prev => prev + 1); };

  return (
    <div className="home-container">
      {/* 헤더 */}
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
            <div className="login-box-btn" onClick={() => navigate('/login')}>
              회원가입 / 로그인
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        
        {/* 검색 배너 */}
        <div className="search-banner">
            <input 
                type="text" 
                className="search-input" 
                placeholder={placeholderText} 
            />
            <button className="search-btn">
                <img 
                    src="img/search.png" 
                    alt="검색" 
                    className="search-icon-img"
                    onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='🔍';}}
                />
            </button>
        </div>

        {/* 1. 구인구직 섹션 */}
        <section className="content-section">
          <div className="section-header-row">
            <h2 className="section-title">구인구직</h2>
            <button className="goto-icon-btn" onClick={() => navigate('/jobs')}>
                 <img 
                    src="img/goto.png" 
                    alt="더보기" 
                    className="goto-icon-img"
                    onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='>';}}
                 />
            </button>
          </div>
          <p className="section-subtitle">가장 최근에 올라온 글을 확인해보세요!</p>
          
          <div className="carousel-wrapper">
             <button 
                className="carousel-arrow left" 
                onClick={handleJobPrev} 
                disabled={jobSlide === 0} 
                style={{opacity: jobSlide===0 ? 0.3 : 1, border:'none', background:'none', cursor:'pointer', fontSize:'24px', fontWeight:'bold', color:'#333'}}
             >
                &lt;
             </button>

             <div className="card-grid">
               {combinedJobs
                 .slice(jobSlide, jobSlide + ITEMS_PER_PAGE)
                 .map((item) => (
                   <div 
                     key={`${item.isRealJob ? 'job' : 'comp'}-${item.id}`} 
                     className="job-card" 
                     onClick={() => navigate(item.isRealJob ? `/job-detail/${item.id}` : `/company-detail/${item.id}`)}
                   >
                     {/* 구인구직 카드 이미지 처리 */}
                     {item.image ? (
                        <div className="gray-panel" style={{backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                     ) : (
                        <div className="gray-panel"></div>
                     )}
                     
                     <div className="job-info">
                       <h3>[ {item.title} ]</h3>
                       <p className="job-date">{item.date}</p>
                       <p className="job-company">{item.name}</p>
                       <p className="job-addr">{item.address ? item.address.split(' ')[0] : '지역'}</p>
                     </div>
                   </div>
               ))}
             </div>

             <button 
                className="carousel-arrow right" 
                onClick={handleJobNext} 
                disabled={jobSlide + ITEMS_PER_PAGE >= combinedJobs.length} 
                style={{opacity: jobSlide+ITEMS_PER_PAGE >= combinedJobs.length ? 0.3 : 1, border:'none', background:'none', cursor:'pointer', fontSize:'24px', fontWeight:'bold', color:'#333'}}
             >
                &gt;
             </button>
          </div>
        </section>

        {/* 2. 회사정보 섹션 (수정된 부분) */}
        <section className="content-section">
          <div className="section-header-row">
            <h2 className="section-title">회사정보</h2>
            <button className="goto-icon-btn" onClick={() => navigate('/companies')}>
                 <img 
                    src="img/goto.png"
                    alt="더보기" 
                    className="goto-icon-img"
                    onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='>';}}
                 />
            </button>
          </div>
          <p className="section-subtitle">어떤 기업이 궁금하신가요?</p>
          
          <div className="carousel-wrapper">
             <button 
                className="carousel-arrow left" 
                onClick={handleCompanyPrev} 
                disabled={companySlide === 0} 
                style={{opacity: companySlide===0 ? 0.3 : 1, border:'none', background:'none', cursor:'pointer', fontSize:'24px', fontWeight:'bold', color:'#333'}}
             >
                &lt;
             </button>

             <div className="card-grid">
                 {companyData
                   .slice(companySlide, companySlide + ITEMS_PER_PAGE)
                   .map((company) => (
                     <div key={company.id} className="company-card" onClick={() => navigate(`/company-detail/${company.id}`)}>
                        {/* [수정됨] 회사의 profileImage가 있으면 배경으로 설정, 없으면 회색 배경 */}
                        <div 
                            className="gray-panel"
                            style={
                                company.profileImage 
                                ? { backgroundImage: `url(${company.profileImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
                                : {}
                            }
                        ></div>
                        <div className="job-info">
                            <h3>{company.name}</h3>
                            <p className="job-addr">{company.address ? company.address.split(' ')[0] : ''}</p>
                        </div>
                     </div>
                 ))}
             </div>

             <button 
                className="carousel-arrow right" 
                onClick={handleCompanyNext} 
                disabled={companySlide + ITEMS_PER_PAGE >= companyData.length} 
                style={{opacity: companySlide+ITEMS_PER_PAGE >= companyData.length ? 0.3 : 1, border:'none', background:'none', cursor:'pointer', fontSize:'24px', fontWeight:'bold', color:'#333'}}
             >
                &gt;
             </button>
          </div>
        </section>

        {/* 3. 커뮤니티 섹션 */}
        <section className="content-section">
          <div className="section-header-row">
            <h2 className="section-title">커뮤니티</h2>
            <button className="goto-icon-btn" onClick={() => navigate('/community')}>
                 <img 
                    src="img/goto.png" 
                    alt="더보기" 
                    className="goto-icon-img"
                    onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='>';}}
                 />
            </button>
          </div>
          <p className="section-subtitle">요새 핫한 게시물들은?</p>
          
          <div className="community-layout">
             <div className="community-list-box">
                {topPosts.length > 0 ? (
                    topPosts.map((post, index) => (
                        <div 
                            className="community-item" 
                            key={post.id}
                            onClick={() => navigate(`/community/${post.id}`)}
                            style={{cursor: 'pointer'}}
                        >
                            <span className="post-index">{index + 1}.</span>
                            <span className="post-title">
                                {post.title}
                                <span style={{fontSize:'12px', color:'#888', marginLeft:'5px'}}>
                                    ({post.commentCount})
                                </span>
                            </span>
                            <span style={{marginLeft:'auto', fontSize:'13px', color:'#FF5252', fontWeight:'bold', minWidth:'40px', textAlign:'right'}}>
                                ♥ {post.likeCount}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="community-item" style={{justifyContent:'center', color:'#999'}}>
                        아직 인기 게시글이 없습니다.
                    </div>
                )}
             </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;