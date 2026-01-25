import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  
  // [기능 1] 로그인 폼 상태 관리
  // 변수명은 email이지만, 백엔드 DTO에 맞춰 username으로 전송됩니다.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // [디자인 2] 오른쪽 패널 상태 관리 ('default': 환영 문구, 'selection': 회원 유형 선택)
  const [viewMode, setViewMode] = useState('default');

  // [디자인 2] 마우스 움직임에 따른 플로팅 아이콘 애니메이션 로직
  const handleMouseMove = (e) => {
    const floaters = document.querySelectorAll('.floater-wrapper');
    const x = (window.innerWidth - e.pageX) / 40;
    const y = (window.innerHeight - e.pageY) / 40;

    floaters.forEach((floater, index) => {
        const speed = (index % 3 + 1) * 0.5; 
        const direction = index % 2 === 0 ? 1 : -1;
        floater.style.transform = `translate(${x * speed * direction}px, ${y * speed * direction}px)`;
    });
  };

  // [기능 1] 로그인 처리 핸들러 (API 연동 및 세션 저장)
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
        
        // sessionStorage에 저장해야 Home.jsx 등에서 로그인 상태를 인식합니다.
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
        
        {/* --- [디자인 2] 왼쪽 패널: 로그인 폼 --- */}
        <div className="left-panel">
          <div className="header-section">
            <img 
                src="img/logo.png" 
                alt="커리어친구들" 
                className="login-logo-img"
                onClick={() => navigate('/')}
                onError={(e) => {e.target.style.display='none'; e.target.parentElement.innerText='커리어친구들';}} 
            />
          </div>
          
          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <input 
                type="text" 
                className="glass-input" 
                placeholder="아이디" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                type="password" 
                className="glass-input" 
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

        {/* --- [디자인 2] 오른쪽 패널: 인터랙션 및 회원가입 유도 --- */}
        <div className="right-panel" onMouseMove={handleMouseMove}>
          
          <div className="home-text-btn" onClick={() => navigate('/')}>
             &lt; 홈으로 가기
          </div>

          {/* 배경에 떠다니는 아이콘들 */}
          <div className="floating-elements">
              <div className="floater-wrapper f1"><span>📚</span></div>
              <div className="floater-wrapper f2"><span>🎓</span></div>
              <div className="floater-wrapper f3"><span>💡</span></div>
              <div className="floater-wrapper f4"><span>✏️</span></div>
              <div className="floater-wrapper f5"><span>🔍</span></div>
              <div className="floater-wrapper f6"><span>🚀</span></div>
          </div>

          {/* viewMode 상태에 따라 내용 변경 (기본 환영 문구 <-> 회원 유형 선택) */}
          <div className="right-panel-content">
              
              {viewMode === 'default' ? (
                /* [기본 상태] */
                <>
                    <h2 className="welcome-text">아직 회원이 아니신가요?</h2>
                    <p className="welcome-sub-text">
                        간단한 가입으로<br/>
                        커리어친구들과 함께 성장하세요!
                    </p>
                    {/* 버튼 클릭 시 'selection' 모드로 변경 */}
                    <button className="ghost-signup-btn" onClick={() => setViewMode('selection')}>
                        회원가입 하러 가기
                    </button>
                </>
              ) : (
                /* [선택 상태] 개인 vs 기업 */
                <>
                    <h2 className="welcome-text">가입 유형을 선택해주세요</h2>
                    <p className="welcome-sub-text">
                        어떤 목적으로 이용하시나요?
                    </p>
                    
                    <div className="selection-btn-group">
                        <button className="ghost-signup-btn select-btn" onClick={() => navigate('/signup')}>
                            개인 회원
                        </button>
                        <button className="ghost-signup-btn select-btn" onClick={() => navigate('/company-signup')}>
                            기업
                        </button>
                    </div>

                    {/* 취소 버튼 (다시 default 모드로) */}
                    <div className="cancel-text-btn" onClick={() => setViewMode('default')}>
                        취소하고 돌아가기
                    </div>
                </>
              )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;