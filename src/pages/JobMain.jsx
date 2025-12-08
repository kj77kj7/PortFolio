import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/JobMain.css';

const JobMain = () => {
  const navigate = useNavigate();
  
  const [jobPosts, setJobPosts] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const [isCompany, setIsCompany] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
      setIsLoggedIn(true);
      setUserName(user.name);
      if (user.role === 'COMPANY') {
        setIsCompany(true);
      }
    }
    fetchJobs();
  }, []);

  const fetchJobs = (keyword = '') => {
    let url = 'http://localhost:8080/api/jobs';
    if (keyword) {
      url += `?search=${keyword}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => setJobPosts(data))
      .catch(err => console.error(err));
  };

  const handleSearch = () => {
    fetchJobs(searchTerm);
    setCurrentPage(1);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    setIsCompany(false);
    navigate('/'); 
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = jobPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(jobPosts.length / itemsPerPage);

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const getThumbnail = (jsonImages) => {
      try {
          const parsed = JSON.parse(jsonImages);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) { return null; }
      return null;
  };

  return (
    <div className="job-main-container">
      {/* [수정] 통일된 헤더 스타일 */}
      <header className="jm-header" style={{height:'80px', padding:'0 50px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', backgroundColor:'white'}}>
         <div className="logo-area">
            <h1 className="nav-logo" onClick={() => navigate('/')} style={{color:'#2E7D32', fontSize:'26px', fontWeight:'bold', cursor:'pointer', margin:0}}>
                커리어친구들
            </h1>
         </div>
         {/* 메뉴 간격 gap: 50px 로 통일 */}
         <nav className="nav-links" style={{display:'flex', gap:'50px', fontSize:'18px', fontWeight:'bold'}}>
             <span onClick={() => navigate('/jobs')} style={{color:'#2E7D32', cursor:'pointer'}}>구인구직</span>
             <span onClick={() => navigate('/companies')} style={{color:'#333', cursor:'pointer'}}>회사정보</span>
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

      <div className="jm-content">
        <div className="jm-search-bar">
            <input 
                type="text" 
                placeholder="관심있는 기업이나 공고를 검색해보세요" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-icon-btn" onClick={handleSearch}>🔍</button>
        </div>

        <div className="jm-title-row">
            <div>
                <h2 className="section-title">구인구직</h2>
                <p className="section-subtitle">가장 최근에 올라온 글을 확인해보세요!</p>
            </div>
            {isCompany && (
                <button className="write-post-btn" onClick={() => navigate('/jobs/create')}>
                    글 작성
                </button>
            )}
        </div>

        <div className="jm-list-wrapper">
            <button className="page-arrow-btn left" onClick={handlePrevPage} disabled={currentPage === 1}>&lt;</button>
            <div className="jm-grid">
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => {
                        const thumbnail = getThumbnail(post.jobImages);
                        return (
                            <div key={post.id} className="job-card" onClick={() => navigate(`/job-detail/${post.id}`)}>
                                {thumbnail ? (
                                    <div className="image-placeholder" style={{backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                                ) : (
                                    <div className="gray-panel image-placeholder"></div>
                                )}
                                <div className="job-info">
                                    <h3 style={{fontSize:'18px', fontWeight:'bold', margin:'0 0 5px 0'}}>[ {post.title} ]</h3>
                                    <p style={{fontSize:'14px', color:'#666', margin:'0 0 3px 0'}}>{post.startDate} ~ {post.endDate}</p>
                                    <p style={{fontSize:'15px', fontWeight:'bold', color:'#333', margin:'0 0 3px 0'}}>{post.companyName}</p>
                                    <p style={{fontSize:'14px', color:'#888', margin:'0'}}>{post.companyAddress}</p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-data">등록된 공고가 없습니다.</div>
                )}
            </div>
            <button className="page-arrow-btn right" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default JobMain;