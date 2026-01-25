import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../styles/JobPostDetail.css';

// [데이터] JobCreate와 동일한 경력 옵션
const CAREER_OPTIONS = ["신입", "1년 ~ 3년차", "3 ~ 5년차", "5년차 이상"];

// [데이터] 태그 자동완성용 샘플
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
  const fileInputRef = useRef(null);
  
  // --- 상태 관리 ---
  const [jobData, setJobData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // 수정 폼 데이터
  const [editForm, setEditForm] = useState({
      title: '',
      startDate: '',
      endDate: '',
      content: ''
  });

  const [images, setImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedCareers, setSelectedCareers] = useState([]);

  // 태그 상태
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // 유저/지원자 관리 상태
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [resumes, setResumes] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [applicantCount, setApplicantCount] = useState(0);

  // --- 초기 데이터 로드 ---
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
      setUserName(storedUser.name);
    }

    // 공고 상세 정보 Fetch
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
              content: data.content || ''
          });

          if (data.tags && data.tags.trim() !== '') {
              setTags(data.tags.split(' '));
          } else {
              setTags([]);
          }

          try {
             if (data.jobImages) {
                 const parsedImgs = JSON.parse(data.jobImages);
                 if (Array.isArray(parsedImgs)) setImages(parsedImgs);
             }
          } catch(e) { 
              console.error("이미지 파싱 오류", e);
              setImages([]); 
          }

          if (data.totalCareer) {
             const careers = data.totalCareer.split(', ').map(c => c.trim());
             setSelectedCareers(careers);
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
        .then(res => res.json()).then(count => setApplicantCount(count)).catch(console.error);

    if (storedUser && storedUser.role === 'JOB_SEEKER') {
        fetch(`http://localhost:8080/api/applications/check?jobPostId=${id}&userId=${storedUser.id}`)
            .then(res => res.json()).then(applied => setHasApplied(applied)).catch(console.error);
    }
  }, [id, location.state]);

  useEffect(() => {
      if (user && jobData && user.role === 'COMPANY') {
          fetch(`http://localhost:8080/api/applications/job/${id}`)
              .then(res => res.json()).then(data => setApplicants(data)).catch(console.error);
      }
  }, [user, jobData, id]);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteCurrentImage = (e) => {
      e.stopPropagation();
      if (images.length === 0) return;
      if (!window.confirm("현재 사진을 삭제하시겠습니까?")) return;

      const newImages = images.filter((_, idx) => idx !== imageIndex);
      setImages(newImages);
      
      if (imageIndex >= newImages.length) {
          setImageIndex(Math.max(0, newImages.length - 1));
      }
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getVisibleImages = () => {
      if (images.length === 0) return [];
      const first = images[imageIndex];
      const second = images.length > 1 ? images[(imageIndex + 1) % images.length] : null;
      return [first, second];
  };

  const toggleCareer = (option) => {
    if (selectedCareers.includes(option)) setSelectedCareers(selectedCareers.filter(c => c !== option));
    else setSelectedCareers([...selectedCareers, option]);
  };

  const handleEditChange = (e) => {
      const { name, value } = e.target;
      setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
      if (!editForm.title || !editForm.startDate || !editForm.endDate || !editForm.content) {
          alert("모든 필수 항목을 입력해주세요."); return;
      }
      if (images.length < 2) {
          alert("신뢰도를 위해 최소 2장 이상의 사진이 필요합니다."); return;
      }
      if (!window.confirm("수정된 내용을 저장하시겠습니까?")) return;

      const updatedForm = {
          ...editForm,
          jobImages: JSON.stringify(images), 
          totalCareer: selectedCareers.join(', '),
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
              setJobData(prev => ({ ...prev, ...updatedForm }));
          } else {
              alert("수정 실패");
          }
      })
      .catch(err => console.error(err));
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    if (value.trim() === '') { setSuggestions([]); return; }
    const filtered = SAMPLE_TAGS.filter(tag => tag.includes(value) && !tags.includes(tag));
    setSuggestions(filtered);
  };
  const addTag = (tagToAdd) => {
    if (!tags.includes(tagToAdd)) setTags([...tags, tagToAdd]);
    setTagInput(''); setSuggestions([]);
  };
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`); }
  };
  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const handleApply = () => {
      if (!isLoggedIn) { alert("로그인이 필요합니다."); navigate('/login'); return; }
      if (hasApplied) { alert("이미 지원한 공고입니다."); return; }
      if (!resumes.length) { alert("이력서가 없습니다."); return; }
      fetch('http://localhost:8080/api/applications', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({userId:user.id, resumeId:resumes[0].id, jobPostId:jobData.id})
      }).then(async r=>{ if(r.ok){alert("지원완료"); setHasApplied(true); setApplicantCount(prev=>prev+1);} else alert(await r.text()); });
  };
  const handleStatusChange = (aid, stat, name) => {
      if(!window.confirm(`${name}님을 변경하시겠습니까?`)) return;
      fetch(`http://localhost:8080/api/applications/${aid}/status`, {
          method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:stat})
      }).then(r=>{ if(r.ok) setApplicants(prev=>prev.map(a=>a.applicationId===aid?{...a,status:stat}:a)); });
  };
  const handlePreviewResume = (rid) => { fetch(`http://localhost:8080/api/resumes/${rid}`).then(r=>r.json()).then(setSelectedResume); };

  if (!jobData) return <div style={{padding:'100px', textAlign:'center'}}>로딩중...</div>;
  
  const mainImage = images.length > 0 ? images[0] : null; 
  const isMyPost = user && user.role === 'COMPANY' && jobData.companyName === user.name;
  const visibleImages = getVisibleImages();

  return (
    <div className="jd-container">
      <header className="navbar">
        <div className="logo-area" onClick={() => navigate('/')}>
            <img src="/img/logo.png" alt="커리어친구들" className="nav-logo-img" onError={(e)=>{e.target.style.display='none'; e.target.parentElement.innerText='커리어친구들';}} />
        </div>
        <nav className="nav-links">
          <button className="nav-text-link active" style={{color:'#397EFF'}} onClick={() => navigate('/jobs')}>구인구직</button>
          <button className="nav-text-link" onClick={() => navigate('/companies')}>회사정보</button>
          <button className="nav-text-link" onClick={() => navigate('/community')}>커뮤니티</button>
        </nav>
        <div className="auth-area">
          {isLoggedIn ? (
             <div style={{display:'flex', gap:'10px'}}>
                <button className="login-box-btn" onClick={() => navigate('/mypage')}>{userName}님</button>
                <button className="login-box-btn" onClick={handleLogout} style={{width:'100px', color:'#333'}}>로그아웃</button>
             </div>
          ) : (
             <button className="login-box-btn" onClick={() => navigate('/login')}>회원가입 / 로그인</button>
          )}
        </div>
      </header>

      <main className="jd-content">
        <div className="back-link-area" onClick={() => navigate(-1)}>← 취소하고 돌아가기</div>

        {isEditing ? (
            <div className="jc-content" style={{maxWidth:'1000px', padding:'0'}}>
                <h1 className="jc-page-title">공고 수정</h1>
                <div className="jc-divider"></div>

                <div className="jc-images-section">
                    <input type="file" multiple accept="image/*" ref={fileInputRef} style={{display: 'none'}} onChange={handleImageUpload} />
                    <div className="image-upload-header">
                        <label>사진 관리 ({images.length}장) - <span style={{fontSize:'13px', color:'#397EFF'}}>첫 번째 사진이 목록 썸네일이 됩니다.</span></label>
                        <button className="add-photo-btn" onClick={() => fileInputRef.current.click()}>사진 추가</button>
                    </div>
                    
                    <div className="carousel-container">
                        {images.length >= 3 && <button className="carousel-btn left" onClick={prevImage}>&lt;</button>}
                        <div className="carousel-view">
                            {images.length === 0 ? (
                                <><div className="gray-box upload-trigger" onClick={() => fileInputRef.current.click()}></div>
                                  <div className="gray-box upload-trigger" onClick={() => fileInputRef.current.click()}></div></>
                            ) : (
                                <>
                                  <div className="uploaded-image-box">
                                      <img src={visibleImages[0]} alt="img-1" />
                                      <button className="img-delete-btn" onClick={(e) => handleDeleteCurrentImage(e)}>×</button>
                                      {imageIndex === 0 && <div className="thumbnail-badge">대표 사진</div>}
                                  </div>

                                  {images.length > 1 ? (
                                      <div className="uploaded-image-box">
                                          <img src={visibleImages[1]} alt="img-2" />
                                      </div>
                                  ) : (
                                      <div className="gray-box upload-trigger" onClick={() => fileInputRef.current.click()}><span>+</span></div>
                                  )}
                                </>
                            )}
                        </div>
                        {images.length >= 3 && <button className="carousel-btn right" onClick={nextImage}>&gt;</button>}
                    </div>
                    <p style={{fontSize:'12px', color:'#d32f2f', marginTop:'5px'}}>* 최소 2장 이상의 사진이 필요합니다.</p>
                </div>

                <div className="jc-company-name-box">{jobData.companyName}</div>

                <div className="jc-form-group">
                    <label className="jc-label">모집 기간</label>
                    <div className="date-inputs">
                        <input type="date" name="startDate" value={editForm.startDate} onChange={handleEditChange} />
                        <span>~</span>
                        <input type="date" name="endDate" value={editForm.endDate} onChange={handleEditChange} />
                    </div>
                </div>

                <div className="jc-form-group">
                    <label className="jc-label">제목</label>
                    <div className="input-with-btn">
                        <input type="text" name="title" value={editForm.title} onChange={handleEditChange} />
                    </div>
                </div>

                <div className="jc-form-group">
                    <label className="jc-label">총 경력 (중복 선택 가능)</label>
                    <div className="career-selector">
                        {CAREER_OPTIONS.map((option) => (
                            <button 
                                key={option} 
                                className={`career-option-btn ${selectedCareers.includes(option) ? 'selected' : ''}`}
                                onClick={() => toggleCareer(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="jc-form-group">
                    <label className="jc-label">포지션 상세</label>
                    <div className="textarea-wrapper">
                        <textarea name="content" value={editForm.content} onChange={handleEditChange} rows="8"></textarea>
                    </div>
                </div>

                <div className="jc-form-group">
                    <label className="jc-label">태그</label>
                    <div className="tag-input-container">
                        {tags.map((tag, i) => (
                            <div key={i} className="tag-chip"><span>{tag}</span><button onClick={() => removeTag(tag)} className="tag-remove-btn">×</button></div>
                        ))}
                        <input type="text" className="tag-input-field" placeholder="#태그 입력" value={tagInput} onChange={handleTagInputChange} onKeyDown={handleTagKeyDown} />
                    </div>
                    {suggestions.length > 0 && (
                        <ul className="suggestion-list">
                            {suggestions.map((s, i) => <li key={i} onClick={() => addTag(s)}>{s}</li>)}
                        </ul>
                    )}
                </div>

                <div className="jc-actions">
                    <button className="jc-btn save" onClick={handleUpdate}>수정 완료</button>
                    <button className="jc-btn cancel" onClick={() => {
                        if(window.confirm("수정을 취소하시겠습니까?")) navigate(0); 
                    }}>취소</button>
                </div>
            </div>
        ) : (
            <div className="jd-inner-wrapper">
                <div className="jd-images-row">
                   {mainImage ? (
                       <div className="jd-main-img" style={{backgroundImage: `url(${mainImage})`}}></div>
                   ) : (
                       <div className="jd-main-img"></div>
                   )}
                   <div className="jd-sub-img"></div>
                </div>

                <div className="jd-header-info">
                    <div className="jd-text-info">
                      <h1 className="jd-title">{jobData.title}</h1>
                      <p className="jd-subtitle">
                        <span className="bold-company">{jobData.companyName}</span> {jobData.companyAddress}
                      </p>
                      <p style={{marginTop:'10px', color:'#666', fontSize:'14px'}}>
                          기간: {jobData.startDate} ~ {jobData.endDate} | 요구경력: {jobData.totalCareer}
                      </p>
                      <p style={{marginTop:'5px', color:'#397EFF', fontWeight:'bold', fontSize:'14px'}}>
                          📢 현재 {applicantCount}명이 지원했습니다.
                      </p>
                    </div>
                    <div className="jd-action">
                      {isMyPost ? (
                          <button className="apply-btn" style={{backgroundColor:'#666'}} onClick={() => setIsEditing(true)}>수정하기</button>
                      ) : (
                          user?.role === 'JOB_SEEKER' && (
                              <button className="apply-btn" onClick={handleApply} disabled={hasApplied} style={{ backgroundColor: hasApplied ? '#aaa' : '#397EFF', cursor: hasApplied ? 'default' : 'pointer' }}>
                                  {hasApplied ? "지원완료" : "지원하기"}
                              </button>
                          )
                      )}
                    </div>
                </div>
                <div className="jd-divider"></div>

                {isMyPost && (
                    <section className="jd-section">
                        <h3 className="jd-section-title">지원자 현황</h3>
                        <div className="applicant-list">
                            {applicants.length===0 ? <p style={{color:'#999'}}>아직 지원자가 없습니다.</p> : applicants.map(app => (
                                <div key={app.applicationId} className="applicant-card">
                                    <div className="applicant-info-row">
                                        <span className="app-name">{app.applicantName}</span>
                                        <span className="app-career">({app.applicantCareer})</span>
                                        <button className="resume-preview-btn" onClick={() => handlePreviewResume(app.resumeId)}>이력서 미리보기</button>
                                    </div>
                                    <div className="applicant-sub-info">이력서: {app.resumeTitle} | 지원일: {app.appliedAt?.split('T')[0]}</div>
                                    <div className="applicant-actions">
                                        {app.status === 'APPLIED' ? (
                                            <><button className="status-action-btn pass" onClick={() => handleStatusChange(app.applicationId, 'PASSED', app.applicantName)}>합격</button>
                                            <button className="status-action-btn fail" onClick={() => handleStatusChange(app.applicationId, 'FAILED', app.applicantName)}>불합격</button></>
                                        ) : (
                                            <span className={`status-badge ${app.status==='PASSED'?'pass':'fail'}`}>{app.status==='PASSED'?'최종합격':'불합격'}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="jd-divider" style={{marginTop:'30px'}}></div>
                    </section>
                )}
                
                <section className="jd-section">
                  <h3 className="jd-section-title">포지션 상세</h3>
                  <div className="jd-description"><p style={{whiteSpace: 'pre-line'}}>{jobData.content}</p></div>
                </section>
                <section className="jd-section">
                  <h3 className="jd-section-title">태그</h3>
                  <div className="jd-tags">{tags.length > 0 ? tags.map((t,i)=><span key={i}>#{t.replace('#','')}</span>) : <span style={{color:'#999'}}>태그 없음</span>}</div>
                </section>
            </div>
        )}
      </main>

      {selectedResume && (
          <div className="resume-modal-overlay" onClick={() => setSelectedResume(null)}>
              <div className="resume-modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="resume-modal-header">
                      <h2>{selectedResume.title}</h2>
                      <button className="resume-modal-close" onClick={() => setSelectedResume(null)}>&times;</button>
                  </div>
                  <div className="resume-modal-body">
                      <div className="rm-profile">
                          <div className="rm-avatar">
                              {selectedResume.profileImage ? <img src={selectedResume.profileImage} alt="profile"/> : <div className="rm-no-img">No Img</div>}
                          </div>
                          <div className="rm-info">
                              <h3>{selectedResume.user?.name}</h3>
                              <p>{selectedResume.user?.email}</p>
                              <p>{selectedResume.career} / {selectedResume.jobGroup}</p>
                          </div>
                      </div>
                      
                      <hr className="rm-divider" />
                      
                      {/* [추가] 동적 섹션 렌더링 */}
                      {selectedResume.customSections && (
                         (() => {
                           try {
                             const sections = JSON.parse(selectedResume.customSections);
                             return sections.map(sec => (
                               <div key={sec.id} className="rm-section">
                                  <h4>{sec.title}</h4>
                                  <div className="rm-text-box" dangerouslySetInnerHTML={{ __html: sec.content }}></div>
                               </div>
                             ));
                           } catch(e) { return null; }
                         })()
                      )}

                      <div className="rm-section">
                          <h4>자기소개</h4>
                          {selectedResume.selfIntro ? (
                              <div className="rm-text-box" dangerouslySetInnerHTML={{ __html: selectedResume.selfIntro }}></div>
                          ) : (
                              <div className="rm-text-box">내용 없음</div>
                          )}
                      </div>
                      
                      <div className="rm-section">
                          <h4>포트폴리오 / 링크</h4>
                          <div className="rm-links">
                              {selectedResume.links ? selectedResume.links.split(', ').map((l,i)=><a key={i} href={l} target="_blank" rel="noopener noreferrer">🔗 {l}</a>) : <p>링크 없음</p>}
                          </div>
                      </div>

                      {/* [추가] 이력서 상세보기 버튼 (오른쪽 하단) */}
                      <div style={{display:'flex', justifyContent:'flex-end', marginTop:'20px'}}>
                          <button 
                             onClick={() => navigate(`/resumes/${selectedResume.id}`)}
                             style={{
                                 padding:'10px 20px', backgroundColor:'#397EFF', color:'white', 
                                 border:'none', borderRadius:'6px', fontWeight:'bold', cursor:'pointer'
                             }}
                          >
                              이력서 상세보기 &gt;
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default JobPostDetail;