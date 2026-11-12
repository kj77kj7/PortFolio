import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignUp.css';

const Signup = () => {
  const navigate = useNavigate();

  // [기능 유지] 폼 데이터 및 상태 관리 (내국인 여부 포함)
  const [formData, setFormData] = useState({
    name: '',
    isForeigner: false, // false: 내국인(기본), true: 외국인
    birthdate: '',
    career: 'new',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    jobGroup: 'developer',
    role: 'JOB_SEEKER'
  });

  const [errors, setErrors] = useState({
    name: '',
    birthdate: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });

  // [기능 유지] 나이 계산 함수
  const calculateAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // [기능 유지] 유효성 검사 로직
  const validateField = (name, value, currentFormData) => {
    let msg = '';
    const form = currentFormData || formData;

    // 1. 이름 검사 (내국인인 경우 한글만 허용)
    if (name === 'name' || name === 'isForeigner') {
      const nameValue = name === 'name' ? value : form.name;
      const isForeignerValue = name === 'isForeigner' ? value : form.isForeigner;

      if (!isForeignerValue && nameValue.length > 0) {
        const koreanRegex = /^[가-힣]+$/;
        if (!koreanRegex.test(nameValue)) {
          return '내국인은 한글 이름만 입력 가능합니다.';
        }
      }
      return '';
    }

    // 2. 생년월일 검사 (만 19세 미만)
    if (name === 'birthdate') {
      if (value) {
        const age = calculateAge(value);
        if (age < 19) {
          msg = '미성년자는 가입이 불가능합니다.';
        }
      }
    }

    // 3. 아이디 검사
    if (name === 'username') {
      if (value.length > 0 && (value.length < 6 || value.length > 15)) {
        msg = '아이디는 6자 이상 15자 이하여야 합니다.';
      }
    }

    // 4. 비밀번호 검사
    if (name === 'password') {
      const regex = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
      if (value.length > 0 && !regex.test(value)) {
        msg = '비밀번호는 영문자, 특수문자를 포함하여 8~15자여야 합니다.';
      }
    }

    // 5. 비밀번호 확인
    if (name === 'confirmPassword') {
      if (value.length > 0 && value !== form.password) {
        msg = '비밀번호가 일치하지 않습니다.';
      }
    }

    // 6. 이메일 검사
    if (name === 'email') {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value.length > 0 && !regex.test(value)) {
        msg = '올바른 이메일 형식이 아닙니다.';
      }
    }

    return msg;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // [기능 유지] 라디오/체크박스 값 처리
    const finalValue = type === 'checkbox' ? checked : (name === 'isForeigner' ? (value === 'true') : value);
    
    const nextFormData = { ...formData, [name]: finalValue };
    setFormData(nextFormData);

    // 이름이나 내국인 여부가 바뀌면 'name' 필드 에러 갱신
    if (name === 'name' || name === 'isForeigner') {
        const errorMsg = validateField('name', name === 'name' ? finalValue : nextFormData.name, nextFormData); 
        const nameError = validateField('name', nextFormData.name, { ...nextFormData, isForeigner: nextFormData.isForeigner });
        setErrors(prev => ({ ...prev, name: nameError }));
    } else {
        const errorMsg = validateField(name, finalValue, nextFormData);
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
    }

    // 비밀번호 확인 실시간 체크
    if (name === 'password' && formData.confirmPassword) {
       if (finalValue !== formData.confirmPassword) {
         setErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
       } else {
         setErrors(prev => ({ ...prev, confirmPassword: '' }));
       }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // 제출 전 전체 검사
    const hasErrors = Object.values(errors).some(msg => msg !== '') || 
                      !formData.name || !formData.birthdate || !formData.username;
    
    if (hasErrors) {
      alert('입력 정보를 다시 확인해주세요 (붉은색 에러 메시지 확인).');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('회원가입 성공!');
        navigate('/login');
      } else {
        const errorMsg = await response.text();
        if (errorMsg.includes("아이디")) setErrors(prev => ({ ...prev, username: errorMsg }));
        else if (errorMsg.includes("이메일")) setErrors(prev => ({ ...prev, email: errorMsg }));
        else alert(errorMsg);
      }
    } catch (error) {
      console.error(error);
      alert('서버 오류 발생');
    }
  };

  return (
    <div className="signup-container">
      
      {/* [디자인 1 적용] 왼쪽 상단 돌아가기 버튼 */}
      <div className="signup-header-left">
          <div className="back-link-wrapper" onClick={() => navigate('/login')}>
              ← 로그인 페이지로 돌아가기
          </div>
      </div>

      <div className="signup-card">
        
        <h2 className="signup-page-title">개인 회원가입</h2>
        
        <form onSubmit={handleSignup} className="signup-form">
          
          {/* [기능 유지 + 디자인 적용] 이름 입력 + 내국인/외국인 라디오 */}
          <div className="form-group">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px'}}>
                <label>이름</label>
                {/* 내국인/외국인 선택 UI */}
                <div style={{fontSize:'14px', color:'#555'}}>
                    <label style={{marginRight:'10px', cursor:'pointer', fontWeight:'400'}}>
                        <input 
                            type="radio" 
                            name="isForeigner" 
                            value="false" 
                            checked={formData.isForeigner === false} 
                            onChange={handleChange} 
                            style={{marginRight:'4px'}}
                        /> 내국인
                    </label>
                    <label style={{cursor:'pointer', fontWeight:'400'}}>
                        <input 
                            type="radio" 
                            name="isForeigner" 
                            value="true" 
                            checked={formData.isForeigner === true} 
                            onChange={handleChange} 
                            style={{marginRight:'4px'}}
                        /> 외국인
                    </label>
                </div>
            </div>
            <input 
                type="text" 
                name="name" 
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                value={formData.name} 
                onChange={handleChange} 
                placeholder="이름을 입력하세요"
                required 
            />
            {errors.name && <span className="validation-msg error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>생년월일</label>
            <input 
                type="date" 
                name="birthdate" 
                className={`form-input ${errors.birthdate ? 'input-error' : ''}`}
                value={formData.birthdate} 
                onChange={handleChange}
                required 
            />
            {errors.birthdate && <span className="validation-msg error">{errors.birthdate}</span>}
          </div>

          <div className="form-group">
            <label>경력</label>
            <select name="career" className="form-input" value={formData.career} onChange={handleChange}>
              <option value="new">신입</option>
              <option value="junior">1~3년차</option>
              <option value="senior">3년차 이상</option>
            </select>
          </div>

          <div className="form-group">
            <label>아이디</label>
            <input 
                type="text" 
                name="username" 
                className={`form-input ${errors.username ? 'input-error' : ''}`}
                value={formData.username} 
                onChange={handleChange} 
                placeholder="6~15자 이내"
                required
            />
            {errors.username && <span className="validation-msg error">{errors.username}</span>}
            {!errors.username && formData.username.length >= 6 && <span className="validation-msg success">사용 가능한 형식입니다.</span>}
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input 
                type="password" 
                name="password" 
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                value={formData.password} 
                onChange={handleChange} 
                placeholder="영문, 특수문자 포함 8~15자"
                required
            />
            {errors.password && <span className="validation-msg error">{errors.password}</span>}
            
            <input 
                type="password" 
                name="confirmPassword" 
                className={`form-input mt-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="비밀번호 확인"
                required
            />
            {errors.confirmPassword && <span className="validation-msg error">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label>이메일</label>
            <input 
                type="email" 
                name="email" 
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                value={formData.email} 
                onChange={handleChange} 
                placeholder="example@naver.com"
                required
            />
            {errors.email && <span className="validation-msg error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>직군</label>
            <select name="jobGroup" className="form-input" value={formData.jobGroup} onChange={handleChange}>
              <option value="developer">개발</option>
              <option value="designer">디자인</option>
              <option value="planner">기획</option>
              <option value="marketing">마케팅</option>
            </select>
          </div>

          <div className="submit-container">
            <button type="submit" className="submit-btn" disabled={Object.values(errors).some(msg => msg !== '')}>
              회원가입 완료
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Signup;