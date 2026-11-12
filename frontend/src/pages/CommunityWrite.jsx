import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CommunityWrite.css';

const CommunityWrite = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // [로직] 상태 관리 (CommunityWrite.jsx 로직 유지)
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // Base64 문자열 배열

  // [디자인] 헤더 처리를 위한 추가 상태 (UI 표현용)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // [로직] 유저 세션 확인
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (!storedUser) {
        alert("로그인이 필요합니다.");
        navigate('/login');
    } else {
        setUser(storedUser);
        setIsLoggedIn(true);
    }
  }, [navigate]);

  // [로직+디자인] 로그아웃 핸들러 (헤더 UI 지원용)
  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  // [로직] 이미지 업로드 핸들러 (Base64 변환 유지)
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

  // [로직] 게시글 등록 핸들러 (CommunityWrite.jsx 로직 100% 유지)
  const handleSubmit = () => {
      if (!title.trim() || !content.trim()) {
          alert("제목과 내용을 입력해주세요.");
          return;
      }

      const payload = {
          userId: user.id,
          title: title,
          content: content,
          images: JSON.stringify(images)
      };

      fetch('http://localhost:8080/api/community', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      })
      .then(res => {
          if (res.ok) {
              alert("게시글이 등록되었습니다.");
              navigate('/community'); // 목록으로 이동
          } else {
              alert("등록 실패");
          }
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="cw-page-container">
      
      {/* [디자인] 상단바 (CommunityWrite1.jsx 디자인 적용) */}
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
          <button className="nav-text-link active" style={{color:'#397EFF'}} onClick={() => navigate('/community')}>커뮤니티</button>
        </nav>

        <div className="auth-area">
          {isLoggedIn && user ? (
             <div style={{display:'flex', gap:'10px'}}>
                <button className="login-box-btn" onClick={() => navigate('/mypage')}>
                  {user.name}님
                </button>
                <button className="login-box-btn" onClick={handleLogout} style={{width:'100px', color:'#333'}}>
                  로그아웃
                </button>
             </div>
          ) : (
             <button className="login-box-btn" onClick={() => navigate('/login')}>
               회원가입 / 로그인
             </button>
          )}
        </div>
      </header>

      {/* [디자인] 메인 컨텐츠 래퍼 */}
      <main className="cw-content">
        
        {/* [디자인] 돌아가기 버튼 */}
        <div className="cw-back-link" onClick={() => navigate('/community')}>
            ← 목록으로 돌아가기
        </div>

        {/* [디자인] 내부 래퍼 (중앙 정렬 폼) */}
        <div className="cw-inner-wrapper">
            
            <div className="cw-header-box">
                <h2 className="cw-page-title">게시글 작성</h2>
            </div>

            <div className="cw-form-box">
                {/* [로직 연결] 제목 입력 */}
                <input 
                    type="text" 
                    className="cw-title-input" 
                    placeholder="제목을 입력해 주세요."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* [로직 연결] 내용 입력 */}
                <textarea 
                    className="cw-textarea" 
                    placeholder="나누고 싶은 생각을 자유롭게 적어보세요!"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                ></textarea>

                {/* [디자인 + 로직 연결] 이미지 업로드 섹션 */}
                <div className="cw-image-section">
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        ref={fileInputRef} 
                        style={{display:'none'}}
                        onChange={handleImageUpload}
                    />
                    
                    <div className="cw-add-img-btn" onClick={() => fileInputRef.current.click()}>
                        <div className="plus-icon">+</div>
                        <span>이미지 추가</span>
                    </div>

                    <div className="cw-preview-list">
                        {images.map((img, idx) => (
                            <div key={idx} className="cw-preview-item">
                                <img src={img} alt="preview" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cw-submit-area">
                    <button className="cw-submit-btn" onClick={handleSubmit}>
                        등록하기
                    </button>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default CommunityWrite;