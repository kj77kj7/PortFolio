import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CompanySignup.css';

const CompanySignup = () => {
  const navigate = useNavigate();

  // [기능 유지] 폼 데이터 관리
  const [formData, setFormData] = useState({
    name: '',           // 기업명
    businessNumber: '', // 사업자번호
    username: '',       // 아이디
    password: '',       // 비밀번호
    email: '',          // 담당자 이메일 (기업은 입력 안 함/유효성 체크 안 함)
    role: 'COMPANY'     // 역할 고정
  });

  // [기능 유지] 주소 관련 상태
  const [addressData, setAddressData] = useState({
    zipcode: '',
    addr: '',
    detailAddr: ''
  });

  // [기능 유지] 에러 상태 관리
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    businessNumber: ''
  });

  // [기능 유지] 카카오 주소 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // [기능 유지] 주소 검색 핸들러
  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        let fullAddress = data.address; 
        let extraAddress = ''; 

        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
          }
          fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setAddressData(prev => ({
            ...prev,
            zipcode: data.zonecode,
            addr: fullAddress
        }));
      }
    }).open();
  };

  // [기능 유지] 유효성 검사 로직
  const validateField = (name, value) => {
      let msg = '';

      // 1. 아이디 검사 (6~15자)
      if (name === 'username') {
          if (value.length > 0 && (value.length < 6 || value.length > 15)) {
              msg = '아이디는 6자 이상 15자 이하여야 합니다.';
          }
      }

      // 2. 비밀번호 검사 (영문, 특수문자 포함 8~15자)
      if (name === 'password') {
          const regex = /^(?=.*[A-Za-z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
          if (value.length > 0 && !regex.test(value)) {
              msg = '비밀번호는 영문자, 특수문자를 포함하여 8~15자여야 합니다.';
          }
      }

      return msg;
  };

  // [기능 유지] 입력 핸들러 (실시간 에러 체크 포함)
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 값 업데이트
    setFormData({ ...formData, [name]: value });
    
    // 입력할 때마다 실시간 검사 및 에러 메시지 세팅
    const errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  // [기능 유지] 상세 주소 핸들러
  const handleAddressChange = (e) => {
      const { name, value } = e.target;
      setAddressData(prev => ({ ...prev, [name]: value }));
  };

  // [기능 유지] 회원가입 제출 로직
  const handleSignup = async (e) => {
    e.preventDefault();

    // 제출 전 에러 체크
    const hasErrors = Object.values(errors).some(msg => msg !== '');
    if (hasErrors) {
        alert("입력 정보를 다시 확인해주세요 (붉은색 에러 메시지 확인).");
        return;
    }

    // 필수값 체크
    if(!formData.name || !formData.businessNumber || !formData.username || !formData.password || !addressData.zipcode || !addressData.addr) {
        alert('필수 정보를 모두 입력해주세요.');
        return;
    }

    const finalAddress = `[${addressData.zipcode}] ${addressData.addr} ${addressData.detailAddr}`;

    const submitData = {
        ...formData,
        address: finalAddress
    };

    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert('기업 회원가입이 완료되었습니다!');
        navigate('/login'); // 성공 시 로그인 페이지로 이동
      } else {
        const errorMsg = await response.text();
        
        // 백엔드 에러 메시지 매핑
        if (errorMsg.includes("이미 가입 되어있는 회사")) {
            setErrors(prev => ({ ...prev, businessNumber: errorMsg }));
        } 
        else if (errorMsg.includes("아이디")) {
            setErrors(prev => ({ ...prev, username: errorMsg }));
        }
        else {
            alert(`가입 실패: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error(error);
      alert('서버 오류 발생');
    }
  };

  return (
    <div className="cs-container">
      
      {/* [디자인 적용] 헤더: 로고 삭제, 돌아가기 버튼만 왼쪽 상단 고정 */}
      <div className="cs-header-left">
          <div className="cs-back-link" onClick={() => navigate('/login')}>
             ← 로그인 페이지로 돌아가기
          </div>
      </div>

      {/* [디자인 적용] 중앙 카드 박스 */}
      <div className="cs-card">
        <h2 className="cs-title">기업 회원가입</h2>

        <form onSubmit={handleSignup} className="cs-form">
          
          {/* 기업명 */}
          <div className="cs-group">
            <label>기업명</label>
            <input 
                type="text" 
                name="name" 
                className="cs-input" 
                placeholder="ex) SK 하이닉스" 
                value={formData.name}
                onChange={handleChange}
            />
          </div>

          {/* 사업자등록번호 (유효성 체크 결과 포함) */}
          <div className="cs-group">
            <label>사업자등록번호</label>
            <input 
                type="text" 
                name="businessNumber" 
                className={`cs-input ${errors.businessNumber ? 'input-error' : ''}`}
                placeholder="- 없이 입력" 
                value={formData.businessNumber}
                onChange={handleChange}
            />
            {/* [기능 유지] 에러/성공 메시지 표시 */}
            {errors.businessNumber ? (
                <span className="cs-msg error">{errors.businessNumber}</span>
            ) : (
                formData.businessNumber.length > 0 && <span className="cs-msg success">가입 가능한 기업입니다</span>
            )}
          </div>

          {/* 주소 입력란 */}
          <div className="cs-group">
            <label>주소</label>
            
            {/* [디자인 적용] 주소 검색 행 스타일 */}
            <div className="address-row">
                <input 
                    type="text" 
                    name="zipcode"
                    className="cs-input zipcode-input" 
                    placeholder="우편번호" 
                    value={addressData.zipcode}
                    readOnly 
                />
                <button type="button" className="addr-search-btn" onClick={handleAddressSearch}>
                    주소 검색
                </button>
            </div>

            <input 
                type="text" 
                name="addr"
                className="cs-input mt-2" 
                placeholder="기본 주소" 
                value={addressData.addr}
                readOnly
            />

            <input 
                type="text" 
                name="detailAddr"
                className="cs-input mt-2" 
                placeholder="상세 주소를 입력하세요" 
                value={addressData.detailAddr}
                onChange={handleAddressChange}
            />
          </div>

          {/* 아이디 */}
          <div className="cs-group" style={{marginTop: '20px'}}>
             <label>아이디 (담당자)</label>
             <input 
                type="text" 
                name="username" 
                className={`cs-input ${errors.username ? 'input-error' : ''}`} 
                placeholder="6~15자 이내"
                value={formData.username} 
                onChange={handleChange} 
             />
             {/* [기능 유지] 에러 메시지 표시 */}
             {errors.username && <span className="cs-msg error">{errors.username}</span>}
             {!errors.username && formData.username.length >= 6 && <span className="cs-msg success">사용 가능한 형식입니다.</span>}
          </div>
          
          {/* 비밀번호 */}
          <div className="cs-group">
             <label>비밀번호</label>
             <input 
                type="password" 
                name="password" 
                className={`cs-input ${errors.password ? 'input-error' : ''}`}
                placeholder="영문, 특수문자 포함 8~15자" 
                value={formData.password} 
                onChange={handleChange} 
             />
             {/* [기능 유지] 에러 메시지 표시 */}
             {errors.password && <span className="cs-msg error">{errors.password}</span>}
          </div>

          <div className="cs-submit-area">
             <button type="submit" className="cs-submit-btn">회원가입 완료</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CompanySignup;