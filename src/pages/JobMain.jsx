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

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.role === 'COMPANY') {
      setIsCompany(true);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPosts = jobPosts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(jobPosts.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // 이미지 파싱 헬퍼 (JSON 문자열 -> 첫번째 이미지)
  const getThumbnail = (jsonImages) => {
      try {
          const parsed = JSON.parse(jsonImages);
          if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed[0];
          }
      } catch (e) {
          return null;
      }
      return null;
  };

  return (
    <div className="job-main-container">
      <header className="jm-header">
         <h1 className="nav-logo" onClick={() => navigate('/')}>커리어친구들</h1>
         <nav className="nav-links">
             <span style={{color:'#2E7D32'}}>구인구직</span>
             <span onClick={() => navigate('/')}>회사정보</span>
             <span onClick={() => navigate('/')}>커뮤니티</span>
         </nav>
         <div className="auth-btn-placeholder" onClick={() => navigate('/')}>메인으로</div>
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
            <button className="page-arrow-btn left" onClick={handlePrevPage} disabled={currentPage === 1}>
                &lt;
            </button>

            <div className="jm-grid">
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => {
                        const thumbnail = getThumbnail(post.jobImages);
                        return (
                            <div key={post.id} className="job-card" onClick={() => navigate(`/job-detail/${post.id}`)}>
                                {/* 이미지가 있으면 썸네일, 없으면 회색 패널 */}
                                {thumbnail ? (
                                    <div className="image-placeholder" style={{backgroundImage: `url(${thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                                ) : (
                                    <div className="gray-panel image-placeholder"></div>
                                )}
                                
                                <div className="job-info">
                                    {/* 1. 제목 (굵은글씨) */}
                                    <h3 style={{fontSize:'18px', fontWeight:'bold', margin:'0 0 5px 0'}}>[ {post.title} ]</h3>
                                    
                                    {/* 2. 모집기간 */}
                                    <p style={{fontSize:'14px', color:'#666', margin:'0 0 3px 0'}}>
                                        {post.startDate} ~ {post.endDate}
                                    </p>
                                    
                                    {/* 3. 회사명 */}
                                    <p style={{fontSize:'15px', fontWeight:'bold', color:'#333', margin:'0 0 3px 0'}}>
                                        {post.companyName}
                                    </p>
                                    
                                    {/* 4. 회사위치 (DB 정보) */}
                                    <p style={{fontSize:'14px', color:'#888', margin:'0'}}>
                                        {post.companyAddress}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-data">등록된 공고가 없습니다.</div>
                )}
            </div>

            <button className="page-arrow-btn right" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                &gt;
            </button>
        </div>

      </div>
    </div>
  );
};

export default JobMain;