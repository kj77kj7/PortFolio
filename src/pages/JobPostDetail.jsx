import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../styles/JobPostDetail.css';

// 태그 자동완성을 위한 샘플 데이터
const SAMPLE_TAGS = [
  "#재택근무", "#유연근무제", "#주4.5일제", "#탄력근무제", 
  "#자율출퇴근", "#칼퇴보장", "#야근없음", "#워라밸실천",
  "#자유로운연차", "#반반차사용", "#리프레시휴가", "#30분단위휴가",
  "#업계최고연봉", "#연봉상위1%", "#스톡옵션", "#인센티브", 
  "#성과급", "#명절보너스", "#야근수당", "#퇴직금별도",
  "#내일채움공제", "#청년중소기업소득세감면",
  "#수평적조직", "#자유복장", "#님/닉네임문화", "#회식강요안함",
  "#2030젊은조직", "#반려동물동반", "#자유로운의견", "#노션/슬랙사용",
  "#탑다운없는문화", "#상호존중",
  "#점심식대지원", "#저녁식대지원", "#간식무한", "#카페테리아",
  "#최신맥북지원", "#최고성능장비", "#웰컴키트", "#안마의자",
  "#수면실", "#통신비지원", "#교통비지원",
  "#도서비지원", "#교육비지원", "#세미나참가지원", "#스터디모임",
  "#해외워크샵", "#직무교육"
];

const JobPostDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  // 공고 데이터
  const [jobData, setJobData] = useState(null);
  
  // 수정 모드 관련 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
      title: '',
      startDate: '',
      endDate: '',
      totalCareer: '',
      content: ''
  });

  // 태그 관련 상태
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // 유저 및 권한 상태
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 구직자용 상태
  const [resumes, setResumes] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  
  // 기업용 상태
  const [applicants, setApplicants] = useState([]);
  
  // [추가] 이력서 미리보기 모달 상태
  const [selectedResume, setSelectedResume] = useState(null);
  
  // 공통 상태
  const [applicantCount, setApplicantCount] = useState(0);

  // 1. 초기 데이터 로드
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }

    // 공고 상세 정보
    fetch(`http://localhost:8080/api/jobs/${id}`)
      .then(res => {
          if(!res.ok) throw new Error("공고 조회 실패");
          return res.json();
      })
      .then(data => {
          setJobData(data);
          
          setEditForm({
              title: data.title,
              startDate: data.startDate,
              endDate: data.endDate,
              totalCareer: data.totalCareer,
              content: data.content || ''
          });

          if (data.tags && data.tags.trim() !== '') {
              setTags(data.tags.split(' '));
          } else {
              setTags([]);
          }

          if (location.state && location.state.mode === 'edit') {
              if (storedUser && storedUser.role === 'COMPANY' && data.companyName === storedUser.name) {
                  setIsEditing(true);
              }
          }

          if (storedUser && storedUser.role === 'JOB_SEEKER') {
              fetch(`http://localhost:8080/api/resumes/user/${storedUser.id}`)
                  .then(r => r.json())
                  .then(resumeList => setResumes(resumeList))
                  .catch(e => console.error(e));
          }
      })
      .catch(err => console.error(err));

    fetch(`http://localhost:8080/api/applications/count/${id}`)
        .then(res => res.json())
        .then(count => setApplicantCount(count))
        .catch(err => console.error(err));

    if (storedUser && storedUser.role === 'JOB_SEEKER') {
        fetch(`http://localhost:8080/api/applications/check?jobPostId=${id}&userId=${storedUser.id}`)
            .then(res => res.json())
            .then(applied => setHasApplied(applied))
            .catch(err => console.error(err));
    }

  }, [id, location.state]);

  // 2. 기업 회원일 때 지원자 목록 로드
  useEffect(() => {
      if (user && jobData && user.role === 'COMPANY') {
          fetch(`http://localhost:8080/api/applications/job/${id}`)
              .then(res => res.json())
              .then(data => setApplicants(data))
              .catch(err => console.error(err));
      }
  }, [user, jobData, id]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  // --- 수정 관련 핸들러 ---
  const handleEditChange = (e) => {
      const { name, value } = e.target;
      setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);

    if (value.trim() === '') {
        setSuggestions([]);
        return;
    }

    const searchKeyword = value.startsWith('#') ? value : value;
    const filtered = SAMPLE_TAGS.filter(tag => 
        tag.includes(searchKeyword) && !tags.includes(tag)
    );
    setSuggestions(filtered);
  };

  const addTag = (tagToAdd) => {
    if (tags.includes(tagToAdd)) {
        setTagInput('');
        setSuggestions([]);
        return;
    }
    setTags([...tags, tagToAdd]);
    setTagInput('');
    setSuggestions([]);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        const val = tagInput.trim();
        if (!val) return;
        const newTag = val.startsWith('#') ? val : `#${val}`;
        addTag(newTag);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpdate = () => {
      if (!window.confirm("수정하시겠습니까?")) return;

      const updatedForm = {
          ...editForm,
          tags: tags.join(' ')
      };

      fetch(`http://localhost:8080/api/jobs/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedForm)
      })
      .then(res => {
          if (res.ok) {
              alert("수정이 완료되었습니다.");
              setIsEditing(false);
              setJobData(prev => ({ ...prev, ...editForm, tags: tags.join(' ') }));
          } else {
              alert("수정 실패");
          }
      })
      .catch(err => console.error(err));
  };

  // --- 지원하기 핸들러 ---
  const handleApply = () => {
    if (!isLoggedIn) {
        alert("로그인이 필요합니다.");
        navigate('/login');
        return;
    }
    
    if (hasApplied) {
        alert("이미 지원한 공고입니다.");
        return;
    }

    if (!resumes || resumes.length === 0) {
        alert("등록된 이력서가 없습니다. 마이페이지에서 이력서를 먼저 작성해주세요.");
        return;
    }

    const myResume = resumes[0];

    const missingFields = [];
    if (!myResume.profileImage) missingFields.push("프로필 사진");
    if (!myResume.links) missingFields.push("외부 링크");
    if (!myResume.selfIntro) missingFields.push("자기소개");

    if (missingFields.length > 0) {
        const msg = `${missingFields.join(', ')}가(이) 아직 작성되지 않았습니다.\n내용을 전부 작성하지 않는다면 합격에서 불이익을 받을 수 있습니다.\n계속 지원하시겠습니까?`;
        if (!window.confirm(msg)) {
            navigate('/resumes/create');
            return;
        }
    }

    if (jobData.totalCareer && user.career) {
        if (!jobData.totalCareer.includes(user.career)) {
            if (!window.confirm("기업이 요구하는 경력사항과 다릅니다. 지원하시겠습니까?")) return;
        }
    }

    fetch('http://localhost:8080/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user.id,
            resumeId: myResume.id,
            jobPostId: jobData.id
        })
    })
    .then(async res => {
        if (res.ok) {
            alert("지원이 완료되었습니다!");
            setHasApplied(true);
            setApplicantCount(prev => prev + 1);
        } else {
            const msg = await res.text();
            alert("지원 실패: " + msg);
        }
    })
    .catch(err => console.error(err));
  };

  // --- 지원 상태 변경 핸들러 (기업용) ---
  const handleStatusChange = (appId, status, applicantName) => {
      const actionText = status === 'PASSED' ? '합격' : '불합격';
      
      if (!window.confirm(`${applicantName}님을 ${actionText} 시키시겠습니까?\n(확인 후에는 변경할 수 없습니다)`)) {
          return;
      }

      fetch(`http://localhost:8080/api/applications/${appId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: status })
      })
      .then(res => {
          if (res.ok) {
              setApplicants(prev => prev.map(app => 
                  app.applicationId === appId ? { ...app, status: status } : app
              ));
          } else {
              alert("처리 실패");
          }
      });
  };

  // [추가] 이력서 미리보기 핸들러
  const handlePreviewResume = (resumeId) => {
      // 서버에서 이력서 상세 정보 가져오기
      fetch(`http://localhost:8080/api/resumes/${resumeId}`)
        .then(res => res.json())
        .then(data => {
            setSelectedResume(data);
        })
        .catch(err => alert("이력서 정보를 불러오는데 실패했습니다."));
  };

  // [추가] 모달 닫기 핸들러
  const closeResumeModal = () => {
      setSelectedResume(null);
  };

  const getThumbnail = (jsonImages) => {
    try {
        const parsed = JSON.parse(jsonImages);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch { return null; }
  };

  if (!jobData) return <div style={{padding:'50px', textAlign:'center'}}>로딩중...</div>;
  
  const mainImage = getThumbnail(jobData.jobImages);
  const isMyPost = user && user.role === 'COMPANY' && jobData.companyName === user.name;

  return (
    <div className="jd-container">
      {/* 헤더 */}
      <header className="navbar">
        <div className="logo-area">
          <h1 className="nav-logo" onClick={() => navigate('/')}>커리어친구들</h1>
        </div>
        <nav className="nav-links">
          <span onClick={() => navigate('/jobs')}>구인구직</span>
          <span onClick={() => navigate('/companies')}>회사정보</span>
          <span onClick={() => navigate('/community')}>커뮤니티</span>
        </nav>
        <div className="auth-btn-area">
          {isLoggedIn ? (
            <>
              <button className="nav-btn" onClick={() => navigate('/mypage')}>
                마이페이지 ({user.name})
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

      <main className="jd-content">
        <div className="back-link-area" onClick={() => navigate(-1)}>
          ← 리스트로 돌아가기
        </div>

        {/* 수정 버튼 */}
        {isMyPost && !isEditing && (
            <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'10px'}}>
                <button 
                    onClick={() => setIsEditing(true)}
                    style={{
                        padding:'8px 20px', backgroundColor:'#f0f0f0', border:'1px solid #ccc',
                        borderRadius:'4px', fontWeight:'bold', cursor:'pointer'
                    }}
                >
                    수정하기
                </button>
            </div>
        )}

        <div className="jd-images-row">
           {mainImage ? (
               <div className="jd-main-img" style={{backgroundImage: `url(${mainImage})`, backgroundSize:'cover'}}></div>
           ) : (
               <div className="gray-panel jd-main-img"></div>
           )}
           <div className="gray-panel jd-sub-img"></div>
        </div>

        {/* 헤더 정보 */}
        <div className="jd-header-info">
          {isEditing ? (
              <div className="jd-text-info" style={{width:'100%'}}>
                  {/* 수정 모드 UI 생략 (기존과 동일) */}
                  <div style={{marginBottom:'15px'}}>
                      <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>제목</label>
                      <input 
                        type="text" name="title" value={editForm.title} onChange={handleEditChange} 
                        style={{width:'100%', height:'40px', padding:'5px', fontSize:'16px', border:'1px solid #ddd'}}
                      />
                  </div>
                  <div style={{marginBottom:'15px', display:'flex', gap:'10px', alignItems:'center'}}>
                      <label style={{fontWeight:'bold'}}>기간:</label>
                      <input type="date" name="startDate" value={editForm.startDate} onChange={handleEditChange} style={{padding:'5px', border:'1px solid #ddd'}}/>
                      ~
                      <input type="date" name="endDate" value={editForm.endDate} onChange={handleEditChange} style={{padding:'5px', border:'1px solid #ddd'}}/>
                  </div>
                  <div style={{marginBottom:'15px'}}>
                      <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>요구경력</label>
                      <input 
                        type="text" name="totalCareer" value={editForm.totalCareer} onChange={handleEditChange} 
                        style={{width:'100%', height:'40px', padding:'5px', fontSize:'16px', border:'1px solid #ddd'}}
                      />
                  </div>

                  {/* 태그 편집 */}
                  <div style={{marginBottom:'15px'}}>
                      <label style={{fontWeight:'bold', display:'block', marginBottom:'8px', color:'#4285F4'}}>태그 설정</label>
                      <div className="tag-section-wrapper">
                          <div className="tag-input-container">
                              {tags.map((tag, index) => (
                                  <div key={index} className="tag-chip">
                                      <span>{tag}</span>
                                      <button className="tag-remove-btn" onClick={() => removeTag(tag)}>×</button>
                                  </div>
                              ))}
                              <input 
                                  type="text" 
                                  className="tag-input-field"
                                  value={tagInput}
                                  onChange={handleTagInputChange}
                                  onKeyDown={handleTagKeyDown}
                              />
                          </div>
                          {suggestions.length > 0 && (
                              <ul className="suggestion-list">
                                  {suggestions.map((suggestion, idx) => (
                                      <li key={idx} onClick={() => addTag(suggestion)}>
                                          {suggestion}
                                      </li>
                                  ))}
                              </ul>
                          )}
                      </div>
                  </div>
                  
                  <div style={{marginTop:'20px', display:'flex', gap:'10px'}}>
                      <button onClick={handleUpdate} style={{padding:'10px 30px', backgroundColor:'#4285F4', color:'white', border:'none', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>저장</button>
                      <button onClick={() => setIsEditing(false)} style={{padding:'10px 30px', backgroundColor:'#aaa', color:'white', border:'none', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>취소</button>
                  </div>
              </div>
          ) : (
              <>
                <div className="jd-text-info">
                    <h1 className="jd-title">{jobData.title}</h1>
                    <p className="jd-subtitle">
                      <span className="bold-text">{jobData.companyName}</span> 
                      {jobData.companyAddress}
                    </p>
                    <p className="jd-period">모집기간: {jobData.startDate} ~ {jobData.endDate}</p>
                    <p className="jd-career-req">요구경력: {jobData.totalCareer}</p>
                    
                    <p style={{marginTop:'10px', color:'#4285F4', fontWeight:'bold', fontSize:'16px'}}>
                        📢 지원현황 ({applicantCount}명)
                    </p>
                </div>
                
                <div className="jd-action">
                    {isMyPost ? (
                        <div className="company-admin-box">
                            <h3>지원자 관리 ({applicants.length}명)</h3>
                        </div>
                    ) : (
                        user?.role === 'JOB_SEEKER' && (
                            <button 
                                className="apply-btn" 
                                onClick={handleApply}
                                disabled={hasApplied}
                                style={{ backgroundColor: hasApplied ? '#aaa' : '#4285F4', cursor: hasApplied ? 'default' : 'pointer' }}
                            >
                                {hasApplied ? "지원완료" : "지원하기"}
                            </button>
                        )
                    )}
                </div>
              </>
          )}
        </div>

        <div className="divider"></div>

        {/* 지원자 목록 (기업 전용) */}
        {!isEditing && isMyPost && (
            <section className="jd-section">
                <h3 className="jd-section-title">지원자 현황</h3>
                {applicants.length === 0 ? (
                    <p>아직 지원자가 없습니다.</p>
                ) : (
                    <div className="applicant-list">
                        {applicants.map(app => (
                            <div key={app.applicationId} className="applicant-card">
                                <div style={{flex: 1}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'5px'}}>
                                        <div style={{fontWeight:'bold', fontSize:'20px'}}>
                                            {app.applicantName} <span style={{fontSize:'16px', fontWeight:'normal'}}>({app.applicantCareer})</span>
                                        </div>
                                        {/* [추가] 이력서 미리보기 버튼 */}
                                        <button 
                                            className="resume-preview-btn"
                                            onClick={() => handlePreviewResume(app.resumeId)}
                                        >
                                            이력서 미리보기
                                        </button>
                                    </div>
                                    <div style={{color:'#666', marginBottom:'5px'}}>이력서 제목: {app.resumeTitle}</div>
                                    <div style={{fontSize:'14px', color:'#999'}}>
                                        지원일: {app.appliedAt ? app.appliedAt.split('T')[0] : ''}
                                    </div>
                                </div>
                                
                                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                    {app.status === 'APPLIED' ? (
                                        <>
                                            <button 
                                                onClick={() => handleStatusChange(app.applicationId, 'PASSED', app.applicantName)} 
                                                className="status-action-btn pass"
                                            >
                                                합격
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(app.applicationId, 'FAILED', app.applicantName)} 
                                                className="status-action-btn fail"
                                            >
                                                불합격
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`status-badge ${app.status === 'PASSED' ? 'pass' : 'fail'}`}>
                                            {app.status === 'PASSED' ? '최종합격' : '불합격'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="divider" style={{marginTop:'30px'}}></div>
            </section>
        )}

        <section className="jd-section">
          <h3 className="jd-section-title">포지션 상세 및 기업 소개</h3>
          <div className="jd-description">
            {isEditing ? (
                <textarea 
                    name="content" 
                    value={editForm.content} 
                    onChange={handleEditChange}
                    style={{width:'100%', height:'300px', padding:'10px', fontSize:'16px', resize:'none', border:'1px solid #ddd'}}
                ></textarea>
            ) : (
                <>
                    <p style={{fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-line', marginBottom:'30px'}}>
                        {jobData.content || jobData.career}
                    </p>
                    
                    {jobData.tags && (
                        <div style={{marginTop:'20px'}}>
                            <h4 style={{fontSize:'18px', fontWeight:'bold', marginBottom:'10px'}}>태그</h4>
                            <div className="jd-view-tags">
                                {jobData.tags.split(' ').map((tag, idx) => (
                                    <span key={idx} className="jd-view-tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
          </div>
        </section>

      </main>

      {/* [추가] 이력서 미리보기 모달 (팝업) */}
      {selectedResume && (
          <div className="resume-modal-overlay" onClick={closeResumeModal}>
              <div className="resume-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="resume-modal-header">
                      <h2>{selectedResume.title}</h2>
                      <button className="resume-modal-close" onClick={closeResumeModal}>&times;</button>
                  </div>
                  
                  <div className="resume-modal-body">
                      {/* 프로필 섹션 */}
                      <div className="rm-profile">
                          <div className="rm-avatar">
                              {selectedResume.profileImage ? (
                                  <img src={selectedResume.profileImage} alt="profile" />
                              ) : (
                                  <div className="rm-no-img">No Image</div>
                              )}
                          </div>
                          <div className="rm-info">
                              <h3>{selectedResume.user?.name}</h3>
                              <p><strong>직군:</strong> {selectedResume.jobGroup}</p>
                              <p><strong>경력:</strong> {selectedResume.career}</p>
                              <p><strong>Email:</strong> {selectedResume.user?.email}</p>
                          </div>
                      </div>

                      <hr className="rm-divider" />

                      {/* 자기소개 */}
                      <div className="rm-section">
                          <h4>자기소개</h4>
                          <div className="rm-text-box">
                              {selectedResume.selfIntro || "내용 없음"}
                          </div>
                      </div>

                      {/* 링크 */}
                      <div className="rm-section">
                          <h4>포트폴리오 / 링크</h4>
                          {selectedResume.links ? (
                              <div className="rm-links">
                                  {selectedResume.links.split(', ').map((link, i) => (
                                      <a key={i} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noopener noreferrer">
                                          🔗 {link}
                                      </a>
                                  ))}
                              </div>
                          ) : (
                              <p style={{color:'#999'}}>등록된 링크가 없습니다.</p>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default JobPostDetail;