import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  
  // 로그인 폼 상태
  // 변수명은 email로 되어있지만, 실제로는 '아이디(username)'를 입력받습니다.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 오른쪽 패널 상태 관리 ('default' | 'selection')
  const [viewMode, setViewMode] = useState('default');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. 백엔드로 로그인 요청 전송
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 백엔드 LoginRequest DTO는 'username'을 원하므로 email 상태값을 username에 담아 보냅니다.
        body: JSON.stringify({ 
            username: email, 
            password: password 
        }),
      });

      // 2. 응답 처리
      if (response.ok) {
        // 로그인 성공 시: 유저 정보를 받아서 브라우저(세션)에 저장
        const data = await response.json();
        
        // sessionStorage에 저장해야 Home.jsx에서 로그인 상태를 인식합니다.
        sessionStorage.setItem('user', JSON.stringify(data));
        
        alert(`${data.name}님 환영합니다!`);
        navigate('/'); // 홈 화면으로 이동
      } else {
        // 로그인 실패 (비밀번호 틀림 등)
        const errorMsg = await response.text();
        alert(errorMsg || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        
        {/* --- 왼쪽 패널 (흰색): 로그인 폼 --- */}
        <div className="left-panel">
          <div className="header-section">
            <h1 className="brand-title">커리어친구들</h1>
            <div className="header-line"></div>
          </div>
          
          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <input 
                type="text" 
                className="styled-input" 
                placeholder="아이디" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                type="password" 
                className="styled-input" 
                placeholder="비밀번호" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="find-text">
              아이디 찾기 / 비밀번호 찾기
            </div>

            <button type="submit" className="login-action-btn">
              로그인
            </button>
          </form>
        </div>

        {/* --- 오른쪽 패널 (회색): 동적 콘텐츠 --- */}
        <div className="right-panel">
          
          {/* 홈 아이콘 */}
          <div className="home-icon-container" onClick={() => {
              setViewMode('default');
              navigate('/');
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#555" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>

          {/* viewMode에 따른 조건부 렌더링 */}
          {viewMode === 'default' ? (
            <>
              {/* [기본 상태] 비디오 영역 + 회원가입 버튼 */}
              <div className="video-area">
                {/* 추후 영상을 넣을 공간 */}
              </div>

              <div className="signup-btn-wrapper">
                <button className="signup-btn" onClick={() => setViewMode('selection')}>
                  회원가입
                </button>
              </div>
            </>
          ) : (
            <>
              {/* [선택 상태] 유저 vs 기업 선택 */}
              <div className="selection-container">
                <h2 className="selection-title">어떤 타이틀로 이용하실건가요?</h2>
                
                <div className="selection-buttons">
                  <button className="type-select-btn" onClick={() => navigate('/signup')}>
                    유저
                  </button>
                  <div className="divider-line"></div>
                  <button className="type-select-btn" onClick={() => navigate('/company-signup')}>
                    기업
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default Login;