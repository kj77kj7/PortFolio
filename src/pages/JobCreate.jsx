import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/JobCreate.css';

const JobCreate = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    content: ''
  });

  // 추가 상태 관리
  const [selectedCareers, setSelectedCareers] = useState([]); 
  const [images, setImages] = useState([]); 
  const [imageIndex, setImageIndex] = useState(0); 

  const careerOptions = ["신입", "1년 ~ 3년차", "3 ~ 5년차", "5년차 이상"];

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (!storedUser || storedUser.role !== 'COMPANY') {
      alert("기업 회원만 접근 가능합니다.");
      navigate('/jobs');
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCareer = (option) => {
    if (selectedCareers.includes(option)) {
      setSelectedCareers(selectedCareers.filter(c => c !== option));
    } else {
      setSelectedCareers([...selectedCareers, option]);
    }
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

  // [수정] 순환형 네비게이션 로직
  const nextImage = () => {
    if (images.length === 0) return;
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // 현재 보여줄 이미지 2개 계산
  const getVisibleImages = () => {
      if (images.length === 0) return [];
      const first = images[imageIndex];
      // 마지막 이미지일 때 다음 이미지는 0번(처음) 이미지
      const secondIndex = (imageIndex + 1) % images.length;
      const second = images[secondIndex];
      return [first, second];
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.content) {
        alert("모든 항목을 입력해주세요.");
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

  return (
    <div className="jc-container">
      <div className="jc-header-placeholder">
          <span onClick={() => navigate(-1)}>← 취소하고 돌아가기</span>
      </div>

      <div className="jc-content">
        <h1 className="jc-page-title">구인 작성</h1>
        <div className="jc-divider"></div>

        {/* 이미지 업로드 영역 */}
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
                {/* [수정] 왼쪽 화살표: 사진이 3장 이상일 때 항상 표시 */}
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
                        /* 이미지가 있을 때 */
                        <>
                            {/* 첫 번째 이미지 */}
                            <div className="uploaded-image-box">
                                <img src={visibleImages[0]} alt="img-1" />
                            </div>

                            {/* 두 번째 이미지 (1장만 있을 땐 빈 박스로 표시) */}
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

                {/* [수정] 오른쪽 화살표: 사진이 3장 이상일 때 항상 표시 */}
                {images.length >= 3 && (
                    <button className="carousel-btn right" onClick={nextImage}>&gt;</button>
                )}
            </div>
        </div>

        {/* 회사명 */}
        <div className="jc-company-name-box">
            {user ? user.name : '회사명 로딩중...'}
        </div>

        {/* 모집 기간 */}
        <div className="jc-form-group">
            <label>모집 기간</label>
            <div className="date-inputs">
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                <span>~</span>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
            </div>
        </div>

        {/* 제목 */}
        <div className="jc-form-group">
            <label>제목</label>
            <div className="input-with-btn">
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="ex) 백엔드 개발자 (5년 이상)" />
            </div>
        </div>

        {/* 경력 (멀티 선택) */}
        <div className="jc-form-group">
            <label>총 경력 (중복 선택 가능)</label>
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

        {/* 포지션 상세 */}
        <div className="jc-form-group">
            <label>포지션 상세</label>
            <div className="textarea-wrapper">
                <textarea name="content" value={formData.content} onChange={handleChange} rows="8"></textarea>
            </div>
        </div>

        {/* 하단 버튼 */}
        <div className="jc-actions">
            <button className="jc-btn save" onClick={handleSubmit}>저장</button>
            <button className="jc-btn delete" onClick={() => navigate(-1)}>취소</button>
        </div>

      </div>
    </div>
  );
};

export default JobCreate;