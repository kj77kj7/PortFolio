import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../styles/ResumeCreate.css';

// [데이터] 직군 카테고리
const JOB_CATEGORIES = {
  "개발 / IT": [
    "백엔드 개발자", "프론트엔드 개발자", "풀스택 개발자", "웹 개발자",
    "모바일 앱 개발자(Android / iOS)", "데이터 엔지니어", "머신러닝 엔지니어",
    "AI 엔지니어", "데이터 사이언티스트", "DBA(데이터베이스 관리자)",
    "DevOps / 인프라 엔지니어", "시스템/서버 엔지니어", "보안 엔지니어 / 정보보안 담당자",
    "QA / 테스트 엔지니어", "게임 클라이언트 개발자", "게임 서버 개발자",
    "임베디드 개발자", "펌웨어 개발자", "네트워크 엔지니어"
  ],
  "기획 / PM": [
    "서비스 기획자", "제품 기획자(PM)", "프로젝트 매니저", "UI/UX 기획자",
    "게임 기획자", "데이터 분석가(기획)"
  ],
  "디자인": [
    "UX/UI 디자이너", "웹 디자이너", "그래픽 디자이너", "브랜드 디자이너",
    "모션 디자이너", "영상 편집 디자이너", "게임 아트 디자이너"
  ],
  "마케팅 / 콘텐츠": [
    "디지털 마케터", "퍼포먼스 마케터", "콘텐츠 마케터", "SNS 마케터",
    "광고 기획(AE)", "브랜딩 담당자", "카피라이터", "영상 제작자"
  ],
  "영업 / 고객관리": [
    "영업 관리", "B2B 영업", "B2C 영업", "고객 상담(CS)", "고객 성공(CSM)"
  ],
  "경영 / 관리 / 지원": [
    "인사(HR)", "총무", "재무", "회계", "법무", "경영기획", "행정 / 사무"
  ],
  "기타 전문 직군": [
    "리서처", "데이터 입력 / 사무보조", "연구원(R&D)", "품질관리(QC)",
    "생산기술", "물류 / SCM", "구매 / 조달"
  ]
};

const CAREER_OPTIONS = ["신입", "1년 ~ 3년차", "3년 ~ 5년차", "5년차 이상"];

const ResumeCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [resumeId, setResumeId] = useState(null);

  const [profileImg, setProfileImg] = useState(null);
  const [jobGroups, setJobGroups] = useState([]);
  const [career, setCareer] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [links, setLinks] = useState([]);
  const [intro, setIntro] = useState('');

  // [추가] 사용자 정의 섹션 (탭) 상태 관리
  // 구조: [{ id: number, title: string, content: string }]
  const [customSections, setCustomSections] = useState([]);

  const [isJobDropdownOpen, setIsJobDropdownOpen] = useState(false);

  // Quill 설정
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link'
  ];

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (!storedUser) {
        alert("로그인이 필요합니다.");
        navigate('/login');
        return;
    }
    setUser(storedUser);

    fetch(`http://localhost:8080/api/resumes/user/${storedUser.id}`)
      .then(res => res.json())
      .then(data => {
          if (data && data.length > 0) {
              const exist = data[0]; 
              setResumeId(exist.id);
              setProfileImg(exist.profileImage);
              setCareer(exist.career);
              setIntro(exist.selfIntro || ''); 
              if(exist.jobGroup) setJobGroups(exist.jobGroup.split(', '));
              if(exist.links) setLinks(exist.links.split(', '));

              // [추가] 사용자 정의 섹션 복원
              if (exist.customSections) {
                  try {
                      setCustomSections(JSON.parse(exist.customSections));
                  } catch (e) {
                      console.error("섹션 파싱 에러", e);
                  }
              }
          }
      })
      .catch(err => console.error("이력서 조회 실패:", err));
  }, [navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImg(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleJobGroup = (job) => {
    if (jobGroups.includes(job)) {
      setJobGroups(jobGroups.filter(j => j !== job));
    } else {
      if (jobGroups.length >= 5) {
        alert("직군은 최대 5개까지 선택 가능합니다.");
        return;
      }
      setJobGroups([...jobGroups, job]);
    }
  };

  const addLink = () => {
    if (!linkInput.trim()) return;
    setLinks([...links, linkInput.trim()]);
    setLinkInput('');
  };

  const handleLinkKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLink();
    }
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // [추가] 탭 추가 핸들러
  const handleAddTab = () => {
      const title = prompt("추가할 항목의 제목을 입력하세요 (예: 프로젝트 경험, 수상 경력)");
      if (title && title.trim()) {
          setCustomSections([
              ...customSections,
              { id: Date.now(), title: title.trim(), content: '' }
          ]);
      }
  };

  // [추가] 탭 내용 변경 핸들러
  const handleSectionChange = (id, newContent) => {
      setCustomSections(customSections.map(sec => 
          sec.id === id ? { ...sec, content: newContent } : sec
      ));
  };

  // [추가] 탭 삭제 핸들러
  const handleRemoveSection = (id) => {
      if(window.confirm("정말 삭제하시겠습니까?")) {
          setCustomSections(customSections.filter(sec => sec.id !== id));
      }
  };

  const handleSubmit = () => {
    if (jobGroups.length === 0) { alert("직군을 최소 1개 선택해주세요."); return; }
    if (!career) { alert("경력을 선택해주세요."); return; }
    
    const payload = {
        userId: user.id,
        title: `${user.name}님의 이력서`,
        profileImage: profileImg,
        jobGroup: jobGroups.join(', '),
        career: career,
        links: links.join(', '),
        selfIntro: intro,
        customSections: JSON.stringify(customSections) // [추가] JSON 변환하여 전송
    };

    const url = resumeId 
        ? `http://localhost:8080/api/resumes/${resumeId}`
        : 'http://localhost:8080/api/resumes';
    
    const method = resumeId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async res => {
        if(res.ok) {
            alert(resumeId ? "이력서가 수정되었습니다." : "이력서가 저장되었습니다.");
            const updatedUser = { 
                ...user, 
                profileImage: profileImg,
                jobGroup: jobGroups.join(', '),
                career: career
            };
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
            navigate('/mypage');
        } else {
            const msg = await res.text();
            alert("저장 실패: " + msg);
        }
    })
    .catch(err => console.error(err));
  };

  return (
    <div className="rc-container">
      {/* 상단 네비게이션 */}
      <header className="navbar">
        <div className="logo-area" onClick={() => navigate('/')}>
            <img src="/img/logo.png" alt="커리어친구들" className="nav-logo-img" onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='커리어친구들';}} />
        </div>
        <nav className="nav-links">
          <button className="nav-text-link" onClick={() => navigate('/jobs')}>구인구직</button>
          <button className="nav-text-link" onClick={() => navigate('/companies')}>회사정보</button>
          <button className="nav-text-link" onClick={() => navigate('/community')}>커뮤니티</button>
        </nav>
        <div className="auth-area">
             {user && (
                 <div style={{display:'flex', gap:'10px'}}>
                    <button className="login-box-btn" onClick={() => navigate('/mypage')}>{user.name}님</button>
                 </div>
             )}
        </div>
      </header>

      <div className="rc-content">
        <div className="rc-back-link" onClick={() => navigate(-1)}>← 취소하고 돌아가기</div>

        <div className="rc-header-box">
             <h2 className="rc-page-title">{resumeId ? "이력서 수정" : "이력서 작성"}</h2>
        </div>
        
        <div className="rc-main-card">
            
            {/* 1. 프로필 이미지 및 탭 추가 버튼 섹션 */}
            <div className="rc-profile-section">
                <div className="rc-profile-wrapper">
                    <input 
                        type="file" ref={fileInputRef} style={{display:'none'}} 
                        accept="image/*" onChange={handleImageUpload}
                    />
                    <div 
                        className="rc-profile-circle" 
                        onClick={() => fileInputRef.current.click()}
                        style={profileImg ? {backgroundImage: `url(${profileImg})`} : {}}
                    >
                        {!profileImg && <span style={{fontSize:'40px', color:'#ccc'}}>+</span>}
                    </div>
                    
                    {/* [추가] 탭 추가 버튼 (프로필 우측 상단) */}
                    <button className="rc-add-tab-btn" onClick={handleAddTab}>
                        + 탭 추가
                    </button>
                </div>
                <p className="rc-photo-msg">프로필 사진을 등록해주세요</p>
            </div>

            {/* 2. 입력 폼 그룹 */}
            <div className="rc-form-group">
                <label className="rc-label">희망 직군 (최대 5개)</label>
                <div className="rc-custom-select">
                    <div className="rc-select-display" onClick={() => setIsJobDropdownOpen(!isJobDropdownOpen)}>
                        <span style={{color: jobGroups.length === 0 ? '#999' : '#333'}}>
                            {jobGroups.length === 0 ? "직군을 선택해주세요" : jobGroups.join(', ')}
                        </span>
                        <span className="arrow-down">▼</span>
                    </div>
                    {isJobDropdownOpen && (
                        <div className="rc-dropdown-options">
                            {Object.entries(JOB_CATEGORIES).map(([category, jobs]) => (
                                <div key={category} className="rc-category-group">
                                    <div className="rc-category-title">{category}</div>
                                    {jobs.map(option => (
                                        <div 
                                            key={option} 
                                            className={`rc-option-item ${jobGroups.includes(option) ? 'selected' : ''}`}
                                            onClick={() => toggleJobGroup(option)}
                                        >
                                            <input type="checkbox" checked={jobGroups.includes(option)} readOnly />
                                            <span>{option}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="rc-tags-wrapper">
                    {jobGroups.map(job => (
                        <span key={job} className="rc-tag-chip">
                            {job} <button onClick={() => toggleJobGroup(job)}>×</button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="rc-form-group">
                <label className="rc-label">현재 경력</label>
                <div className="rc-radio-group">
                    {CAREER_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            className={`rc-radio-btn ${career === opt ? 'active' : ''}`}
                            onClick={() => setCareer(opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rc-form-group">
                <label className="rc-label">포트폴리오 / 외부 링크</label>
                <div className="rc-link-input-box">
                    <input 
                        type="text" 
                        placeholder="GitHub, 블로그, 포트폴리오 URL 등" 
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onKeyDown={handleLinkKeyDown}
                    />
                    <button className="rc-add-btn" onClick={addLink}>추가</button>
                </div>
                <div className="rc-link-list">
                    {links.map((link, idx) => (
                        <div key={idx} className="rc-link-item">
                            <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>🔗 {link}</span>
                            <button className="rc-link-del" onClick={() => removeLink(idx)}>삭제</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* [추가] 동적으로 추가된 섹션들 렌더링 (자기소개 위에 배치) */}
            {customSections.map((section) => (
                <div className="rc-form-group" key={section.id}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                        <label className="rc-label" style={{marginBottom:0}}>{section.title}</label>
                        <button className="rc-del-section-btn" onClick={() => handleRemoveSection(section.id)}>
                            삭제
                        </button>
                    </div>
                    <div className="rc-quill-wrapper">
                        <ReactQuill 
                            theme="snow"
                            value={section.content}
                            onChange={(val) => handleSectionChange(section.id, val)}
                            modules={modules}
                            formats={formats}
                            className="rc-quill-editor"
                            placeholder={`${section.title}에 대한 내용을 입력해주세요.`}
                        />
                    </div>
                </div>
            ))}

            <div className="rc-form-group">
                <label className="rc-label">자기소개</label>
                <div className="rc-quill-wrapper">
                  <ReactQuill 
                      theme="snow"
                      value={intro}
                      onChange={setIntro}
                      modules={modules}
                      formats={formats}
                      className="rc-quill-editor"
                      placeholder="간단한 자기소개와 업무 강점을 작성해주세요."
                  />
                </div>
            </div>

            <div className="rc-save-area">
                <button className="rc-save-btn" onClick={handleSubmit}>
                    {resumeId ? "수정 완료" : "작성 완료"}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ResumeCreate;