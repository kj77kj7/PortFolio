import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/ResumeDetail.css'; // 위 CSS가 적용된 파일

const ResumeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [resume, setResume] = useState(null);
  const [customSections, setCustomSections] = useState([]);
  const [jobGroups, setJobGroups] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/resumes/${id}`)
      .then(res => res.json())
      .then(data => {
          setResume(data);
          // 데이터 파싱 로직
          if(data.jobGroup) setJobGroups(data.jobGroup.split(', '));
          if(data.links) setLinks(data.links.split(', '));
          if(data.customSections) {
              try {
                  setCustomSections(JSON.parse(data.customSections));
              } catch(e) { console.error("JSON Parse Error", e); }
          }
      })
      .catch(err => {
          console.error(err);
          alert("이력서를 불러올 수 없습니다.");
          navigate(-1);
      });
  }, [id, navigate]);

  if (!resume) return <div style={{padding:'50px', textAlign:'center'}}>로딩중...</div>;

  return (
    <div className="rc-container">
      {/* 상단바 */}
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
          <button className="nav-text-link" onClick={() => navigate('/companies')}>회사정보</button>
          <button className="nav-text-link" onClick={() => navigate('/community')}>커뮤니티</button>
        </nav>
      </header>

      <div className="rc-content">
        <div className="rc-back-link" onClick={() => navigate(-1)}>← 돌아가기</div>

        <div className="rc-header-box">
             <h2 className="rc-page-title">{resume.user?.name ? `${resume.user.name}님의 이력서` : '이력서 상세'}</h2>
        </div>
        
        <div className="rc-main-card">
            
            {/* 1. 프로필 이미지 */}
            <div className="rc-profile-section">
                <div 
                    className="rc-profile-circle" 
                    style={{
                        backgroundImage: resume.profileImage ? `url(${resume.profileImage})` : 'none',
                        cursor: 'default', border: '1px solid #ddd'
                    }}
                >
                    {!resume.profileImage && <span style={{fontSize:'14px', color:'#999'}}>No Image</span>}
                </div>
                <p className="rc-photo-msg" style={{color:'#333', fontWeight:'bold', fontSize:'16px'}}>
                    {resume.user?.email}
                </p>
            </div>

            {/* 2. 직군 */}
            <div className="rc-form-group">
                <label className="rc-label">희망 직군</label>
                <div className="rc-tags-wrapper">
                    {jobGroups.length > 0 ? jobGroups.map((job, i) => (
                        <span key={i} className="rc-tag-chip" style={{padding:'8px 16px', fontSize:'14px', cursor:'default'}}>
                            {job}
                        </span>
                    )) : <span style={{color:'#999'}}>선택된 직군 없음</span>}
                </div>
            </div>

            {/* 3. 경력 (스크롤 적용됨: read-only-box) */}
            <div className="rc-form-group">
                <label className="rc-label">경력</label>
                <div className="read-only-box">
                    {resume.career || "경력 정보가 없습니다."}
                </div>
            </div>

            {/* 4. 링크 */}
            <div className="rc-form-group">
                <label className="rc-label">포트폴리오 / 외부 링크</label>
                <div className="rc-link-list">
                    {links.length > 0 ? links.map((link, idx) => (
                        <div key={idx} className="rc-link-item">
                            <a href={link.startsWith('http') ? link : `http://${link}`} target="_blank" rel="noopener noreferrer" style={{color:'#397EFF', textDecoration:'none'}}>
                                🔗 {link}
                            </a>
                        </div>
                    )) : <div style={{padding:'10px', color:'#999'}}>등록된 링크가 없습니다.</div>}
                </div>
            </div>

            {/* 5. 사용자 정의 섹션 (HTML 내용, 스크롤 적용됨: read-only-html) */}
            {customSections.map((section) => (
                <div className="rc-form-group" key={section.id || Math.random()}>
                    <label className="rc-label">{section.title}</label>
                    <div 
                        className="read-only-html"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                    ></div>
                </div>
            ))}

            {/* 6. 자기소개 (HTML 내용, 스크롤 적용됨: read-only-html) */}
            <div className="rc-form-group">
                <label className="rc-label">자기소개</label>
                <div 
                    className="read-only-html"
                    dangerouslySetInnerHTML={{ __html: resume.selfIntro || "작성된 내용이 없습니다." }}
                ></div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ResumeDetail;