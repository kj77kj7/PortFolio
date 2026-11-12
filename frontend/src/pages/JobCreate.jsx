import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/JobCreate.css';

const JobCreate = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // [로직] 상태 관리 (JobCreate.jsx 원본 로직)
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    content: ''
  });
  
  // [로직] 추가 상태 (경력, 이미지)
  const [selectedCareers, setSelectedCareers] = useState([]); 
  const [images, setImages] = useState([]); 
  const [imageIndex, setImageIndex] = useState(0); 

  // [디자인 지원] 헤더 UI를 위한 상태 (JobCreate1 디자인 호환)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const careerOptions = ["신입", "1년 ~ 3년차", "3 ~ 5년차", "5년차 이상"];

  // [로직] 기업 회원 체크 및 초기화
  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    
    // 기업 회원 체크
    if (!storedUser || storedUser.role !== 'COMPANY') {
      alert("기업 회원만 접근 가능합니다.");
      navigate('/jobs');
      return;
    }
    
    setUser(storedUser);
    
    // [디자인 지원] 헤더 UI용 상태 업데이트
    setIsLoggedIn(true);
    setUserName(storedUser.name);
  }, [navigate]);

  // [디자인 지원] 로그아웃 핸들러
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  // [로직] 입력 핸들러
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // [로직] 경력 토글 핸들러
  const toggleCareer = (option) => {
    if (selectedCareers.includes(option)) {
      setSelectedCareers(selectedCareers.filter(c => c !== option));
    } else {
      setSelectedCareers([...selectedCareers, option]);
    }
  };

  // [로직] 이미지 업로드 핸들러
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

  // [로직] 순환형 네비게이션 로직 (UI 동작)
  const nextImage = () => {
    if (images.length === 0) return;
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // [로직] 현재 보여줄 이미지 2개 계산
  const getVisibleImages = () => {
      if (images.length === 0) return [];
      const first = images[imageIndex];
      const secondIndex = (imageIndex + 1) % images.length;
      const second = images[secondIndex];
      return [first, second];
  };

  // [로직] 제출 핸들러 (JobCreate.jsx의 핵심 유효성 검사 유지)
  const handleSubmit = () => {
    // 1. 필수 텍스트 입력 확인
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.content) {
        alert("모든 항목을 입력해주세요.");
        return;
    }

    // 2. 사진 개수 검사 (최소 2장) - [JobCreate.jsx의 핵심 로직]
    if (images.length < 2) {
        alert("구인 공고의 신뢰도를 위해 최소 2장 이상의 사진을 등록해야 합니다.");
        return;
    }

    const payload = {
        companyId: user.id,
        ...formData,
        totalCareer: selectedCareers.join(', '),
        jobImages: JSON.stringify(images)
    };

    fetch('http://localhost:8080/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if(res.ok) {
            alert("공고가 등록되었습니다.");
            navigate('/jobs');
        } else {
            alert("등록 실패");
        }
    })
    .catch(err => console.error(err));
  };

  const visibleImages = getVisibleImages();

  if (!user) return <div style={{padding:'50px', textAlign:'center'}}>로딩중...</div>;

  return (
    <div className="jc-container">
      
      {/* [디자인] 상단 네비게이션바 (JobCreate1.jsx 스타일 적용) */}
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
          <button className="nav-text-link active" style={{color:'#397EFF'}} onClick={() => navigate('/jobs')}>구인구직</button>
          <button className="nav-text-link" onClick={() => navigate('/companies')}>회사정보</button>
          <button className="nav-text-link" onClick={() => navigate('/community')}>커뮤니티</button>
        </nav>

        <div className="auth-area">
             <div style={{display:'flex', gap:'10px'}}>
                <button className="login-box-btn" onClick={() => navigate('/mypage')}>
                  {userName}님
                </button>
                <button className="login-box-btn" onClick={handleLogout} style={{width:'100px', color:'#333'}}>
                  로그아웃
                </button>
             </div>
        </div>
      </header>

      {/* [디자인] 돌아가기 버튼 */}
      <div className="jc-header-placeholder">
          <span onClick={() => navigate('/jobs')}>← 취소하고 돌아가기</span>
      </div>

      {/* [디자인] 메인 컨텐츠 영역 */}
      <div className="jc-content">
        <h1 className="jc-page-title">구인 작성</h1>
        <div className="jc-divider"></div>

        {/* [디자인] 이미지 업로드 섹션 */}
        <div className="jc-images-section">
            <input 
                type="file" 
                multiple 
                accept="image/*" 
                ref={fileInputRef} 
                style={{display: 'none'}} 
                onChange={handleImageUpload}
            />
            
            <div className="image-upload-header">
                <label>사진을 추가해 보세요 ({images.length}장)</label>
                <button className="add-photo-btn" onClick={() => fileInputRef.current.click()}>
                    사진 추가
                </button>
            </div>
            
            <div className="carousel-container">
                {/* [로직+디자인] 이미지가 3장 이상일 때만 화살표 표시 */}
                {images.length >= 3 && (
                    <button className="carousel-btn left" onClick={prevImage}>&lt;</button>
                )}

                <div className="carousel-view">
                    {images.length === 0 ? (
                        /* 이미지가 없을 때: 빈 회색 박스 2개 */
                        <>
                            <div className="gray-box upload-trigger" onClick={() => fileInputRef.current.click()}></div>
                            <div className="gray-box upload-trigger" onClick={() => fileInputRef.current.click()}></div>
                        </>
                    ) : (
                        /* 이미지가 있을 때: getVisibleImages 로직 사용 */
                        <>
                            <div className="uploaded-image-box">
                                <img src={visibleImages[0]} alt="img-1" />
                            </div>

                            {/* 이미지가 1개 뿐이면 두 번째는 빈 박스 */}
                            {images.length === 1 ? (
                                <div className="gray-box upload-trigger" onClick={() => fileInputRef.current.click()}>
                                    <span>+</span>
                                </div>
                            ) : (
                                <div className="uploaded-image-box">
                                    <img src={visibleImages[1]} alt="img-2" />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {images.length >= 3 && (
                    <button className="carousel-btn right" onClick={nextImage}>&gt;</button>
                )}
            </div>
            
            {/* [로직] JobCreate.jsx에 있던 안내 문구 삽입 */}
            <p style={{fontSize:'12px', color:'#d32f2f', marginTop:'5px'}}>* 최소 2장 이상의 사진이 필요합니다.</p>
        </div>

        {/* [디자인] 회사명 */}
        <div className="jc-company-name-box">
            {user ? user.name : '회사명'}
        </div>

        {/* [디자인] 모집 기간 */}
        <div className="jc-form-group">
            <label className="jc-label">모집 기간</label>
            <div className="date-inputs">
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                <span>~</span>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
            </div>
        </div>

        {/* [디자인] 제목 */}
        <div className="jc-form-group">
            <label className="jc-label">제목</label>
            <div className="input-with-btn">
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="ex) 백엔드 개발자 (5년 이상)" />
            </div>
        </div>

        {/* [디자인] 경력 (멀티 선택) */}
        <div className="jc-form-group">
            <label className="jc-label">총 경력 (중복 선택 가능)</label>
            <div className="career-selector">
                {careerOptions.map((option) => (
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

        {/* [디자인] 포지션 상세 */}
        <div className="jc-form-group">
            <label className="jc-label">포지션 상세</label>
            <div className="textarea-wrapper">
                <textarea name="content" value={formData.content} onChange={handleChange} rows="8"></textarea>
            </div>
        </div>

        {/* [디자인] 하단 버튼 */}
        <div className="jc-actions">
            <button className="jc-btn save" onClick={handleSubmit}>저장</button>
            <button className="jc-btn cancel" onClick={() => navigate('/jobs')}>취소</button>
        </div>

      </div>
    </div>
  );
};

export default JobCreate;