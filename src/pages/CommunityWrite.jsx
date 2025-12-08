import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Community.css';

const CommunityWrite = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]); // Base64 문자열 배열

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (!storedUser) {
        alert("로그인이 필요합니다.");
        navigate('/login');
    } else {
        setUser(storedUser);
    }
  }, [navigate]);

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
    <div className="comm-container">
      {/* 헤더 간소화 (뒤로가기 포함) */}
      <div style={{padding:'20px 40px', borderBottom:'1px solid #eee'}}>
         <h1 className="nav-logo" onClick={() => navigate('/')} style={{color:'#2E7D32', fontSize:'24px', cursor:'pointer', display:'inline-block'}}>커리어친구들</h1>
         <span style={{marginLeft:'20px', fontSize:'14px', color:'#666', cursor:'pointer'}} onClick={() => navigate(-1)}>← 목록으로 돌아가기</span>
      </div>

      <div className="cw-container">
        <h2 style={{textAlign:'center', marginBottom:'30px'}}>게시글 작성</h2>

        {/* 1. 제목 */}
        <input 
            type="text" 
            className="cw-title-input" 
            placeholder="제목을 입력해 주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        {/* 2. 내용 */}
        <textarea 
            className="cw-textarea" 
            placeholder="나누고 싶은 생각을 자유롭게 적어보세요!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
        ></textarea>

        {/* 3. 하단 이미지 추가 (Image 4 스타일) */}
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
                <div className="plus-box">+</div>
                <span>이미지 추가</span>
            </div>

            {/* 미리보기 */}
            <div className="cw-preview-list">
                {images.map((img, idx) => (
                    <img key={idx} src={img} alt="preview" className="cw-preview-img" />
                ))}
            </div>
        </div>

        <button className="cw-submit-btn" onClick={handleSubmit}>등록</button>
      </div>
    </div>
  );
};

export default CommunityWrite;