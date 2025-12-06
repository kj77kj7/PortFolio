import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  
  // 데이터 상태
  const [companyData, setCompanyData] = useState([]); // 회사 정보
  const [jobPosts, setJobPosts] = useState([]);       // 실제 구인 공고
  const [combinedJobs, setCombinedJobs] = useState([]); // 구인구직 통합 리스트

  // 슬라이드 상태 관리 (구인구직 / 회사정보 각각)
  const [jobSlide, setJobSlide] = useState(0);        // 구인구직 슬라이드 인덱스
  const [companySlide, setCompanySlide] = useState(0); // [추가] 회사정보 슬라이드 인덱스
  
  const ITEMS_PER_PAGE = 3; // 한 번에 보여줄 카드 수

  useEffect(() => {
    // 1. 로그인 상태 확인
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.name);
    }

    // 2. 데이터 병렬 Fetch
    Promise.all([
      fetch('http://localhost:8080/api/users/companies').then(res => res.json()),
      fetch('http://localhost:8080/api/jobs').then(res => res.json())
    ])
    .then(([companies, jobs]) => {
      // [수정] 회사 정보 최신순 정렬 (ID 역순)
      const sortedCompanies = companies.sort((a, b) => b.id - a.id);
      setCompanyData(sortedCompanies);
      setJobPosts(jobs);

      // 구인구직 통합 리스트 생성
      const formattedCompanies = sortedCompanies.map(c => ({
        id: c.id,
        isRealJob: false,
        title: c.jobGroup,
        name: c.name,
        address: c.address,
        date: '상시 채용',
        image: null
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
    })
    .catch(err => console.error("데이터 로드 실패:", err));
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate(0); 
  };

  // --- 구인구직 슬라이드 핸들러 ---
  const handleJobPrev = () => {
    if (jobSlide > 0) setJobSlide(prev => prev - 1);
  };
  const handleJobNext = () => {
    if (jobSlide + ITEMS_PER_PAGE < combinedJobs.length) setJobSlide(prev => prev + 1);
  };

  // --- [추가] 회사정보 슬라이드 핸들러 ---
  const handleCompanyPrev = () => {
    if (companySlide > 0) setCompanySlide(prev => prev - 1);
  };
  const handleCompanyNext = () => {
    if (companySlide + ITEMS_PER_PAGE < companyData.length) setCompanySlide(prev => prev + 1);
  };

  return (
    <div className="home-container">
      {/* 네비게이션 바 */}
      <header className="navbar">
        <div className="logo-area">
          <h1 className="nav-logo" onClick={() => navigate('/')}>커리어친구들</h1>
        </div>
        
        <nav className="nav-links">
          <span onClick={() => navigate('/jobs')}>구인구직</span>
          <span onClick={() => navigate('/companies')}>회사정보</span>
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

      <main className="main-content">
        
        {/* 검색 배너 */}
        <div className="search-banner">
            <input type="text" className="search-input" placeholder="관심있는 기업이나 공고를 검색해보세요" />
            <div className="search-icon-box">🔍</div>
        </div>

        {/* 3. 구인구직 섹션 */}
        <section className="content-section">
          <h2 className="section-title">구인구직</h2>
          <p className="section-subtitle">가장 최근에 올라온 글을 확인해보세요!</p>
          
          <div className="carousel-wrapper">
            <button className="carousel-arrow left" onClick={handleJobPrev} disabled={jobSlide === 0}>&lt;</button>

            <div className="carousel-viewport">
                <div className="card-grid" style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', width: '100%'
                }}>
                  {combinedJobs
                    .slice(jobSlide, jobSlide + ITEMS_PER_PAGE)
                    .map((item) => (
                      <div 
                        key={`${item.isRealJob ? 'job' : 'comp'}-${item.id}`} 
                        className="job-card" 
                        onClick={() => navigate(item.isRealJob ? `/job-detail/${item.id}` : `/company-detail/${item.id}`)}
                      >
                        {item.image ? (
                           <div className="image-placeholder" style={{backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                        ) : (
                           <div className="gray-panel image-placeholder"></div>
                        )}
                        <div className="job-info">
                          <h3>[ {item.title} ]</h3>
                          <p className="job-date">{item.date}</p>
                          <p className="job-company">{item.name}</p>
                          <p>{item.address ? item.address.split(' ')[0] + ' ' + item.address.split(' ')[1] : '지역 정보 없음'}</p>
                        </div>
                      </div>
                  ))}
                </div>
            </div>

            <button className="carousel-arrow right" onClick={handleJobNext} disabled={jobSlide + ITEMS_PER_PAGE >= combinedJobs.length}>&gt;</button>
          </div>
        </section>

        {/* 4. 회사정보 섹션 (수정: 캐러셀 적용 및 최신순 정렬) */}
        <section className="content-section">
          <h2 className="section-title">회사정보</h2>
          <p className="section-subtitle">어떤 기업이 궁금하신가요?</p>
          
          <div className="carousel-wrapper">
             <button className="carousel-arrow left" onClick={handleCompanyPrev} disabled={companySlide === 0}>&lt;</button>

             <div className="carousel-viewport">
                <div className="card-grid" style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', width: '100%'
                }}>
                    {companyData
                      .slice(companySlide, companySlide + ITEMS_PER_PAGE)
                      .map((company) => (
                        <div key={company.id} className="company-card" onClick={() => navigate(`/company-detail/${company.id}`)}>
                           <div className="gray-panel company-placeholder"></div>
                           <div style={{marginTop: '10px', fontWeight: 'bold', fontSize: '18px'}}>{company.name}</div>
                        </div>
                    ))}
                </div>
             </div>

             <button className="carousel-arrow right" onClick={handleCompanyNext} disabled={companySlide + ITEMS_PER_PAGE >= companyData.length}>&gt;</button>
          </div>
        </section>

        {/* 5. 커뮤니티 섹션 */}
        <section className="content-section community-section">
          <div className="community-left">
            <h2 className="section-title">커뮤니티</h2>
            <p className="section-subtitle">요새 핫한 게시물들은?</p>
            <div className="community-list-box">
              <div className="community-item">
                  <span className="post-index">1.</span>
                  <span className="post-title">내가 생각하는 복지 최고 회사</span>
              </div>
              <div className="community-item">
                  <span className="post-index">2.</span>
                  <span className="post-title">면접 질문 리스트 공유합니다</span>
              </div>
              <div className="community-item">
                  <span className="post-index">3.</span>
                  <span className="post-title">신입 개발자 포트폴리오 조언 좀...</span>
              </div>
            </div>
          </div>
          <div className="community-right">
             <div className="gray-panel ad-placeholder"></div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;