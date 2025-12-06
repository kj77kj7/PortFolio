import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CompanySignup.css';

const CompanySignup = () => {
  const navigate = useNavigate();

  // 폼 데이터 관리
  const [formData, setFormData] = useState({
    name: '',           // 기업명
    businessNumber: '', // 사업자번호
    username: '',       // 아이디
    password: '',       // 비밀번호
    email: '',          // 담당자 이메일
    role: 'COMPANY'     // 역할 고정
  });

  // 주소 관련 상태 분리 (우편번호, 주소, 상세주소)
  const [addressData, setAddressData] = useState({
    zipcode: '',
    addr: '',
    detailAddr: ''
  });

  const [errors, setErrors] = useState({});

  // 카카오 주소 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 주소 검색 핸들러
  const handleAddressSearch = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

        let fullAddress = data.address; // 기본 주소 변수
        let extraAddress = ''; // 참고 항목 변수

        // 도로명 주소 선택 시 참고항목 조합
        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
          }
          fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        // 상태 업데이트 (우편번호, 기본주소)
        setAddressData(prev => ({
            ...prev,
            zipcode: data.zonecode,
            addr: fullAddress
        }));
      }
    }).open();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
    }
  };

  // 상세주소 변경 핸들러
  const handleAddressChange = (e) => {
      const { name, value } = e.target;
      setAddressData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // 필수값 체크
    if(!formData.name || !formData.businessNumber || !formData.username || !formData.password || !addressData.zipcode || !addressData.addr) {
        alert('필수 정보를 모두 입력해주세요.');
        return;
    }

    // 주소 합치기 (백엔드 전송용) -> "[12345] 서울시 강남구... 상세주소" 형식
    const finalAddress = `[${addressData.zipcode}] ${addressData.addr} ${addressData.detailAddr}`;

    // 전송할 데이터 객체 생성
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
        navigate('/');
      } else {
        const errorMsg = await response.text();
        
        if (errorMsg.includes("이미 가입 되어있는 회사")) {
            setErrors(prev => ({ ...prev, businessNumber: errorMsg }));
        } 
        else if (errorMsg.includes("아이디")) {
            alert(errorMsg);
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
      {/* 상단 헤더 */}
      <div className="cs-header">
        <h1 className="cs-logo">커리어친구들</h1>
      </div>
      
      <div className="cs-back-link" onClick={() => navigate('/')}>
         ← 취소하고 돌아가기
      </div>

      <div className="cs-wrapper">
        <h2 className="cs-title">기업 회원가입</h2>
        <div className="cs-divider"></div>

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

          {/* 사업자등록번호 */}
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
            {errors.businessNumber ? (
                <span className="cs-msg error">{errors.businessNumber}</span>
            ) : (
                formData.businessNumber.length > 0 && <span className="cs-msg success">가입 가능한 기업입니다</span>
            )}
          </div>

          {/* 주소 (3단 분리: 우편번호+버튼 / 기본주소 / 상세주소) */}
          <div className="cs-group">
            <label>주소</label>
            
            {/* 1행: 우편번호 + 주소검색 버튼 */}
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

            {/* 2행: 기본 주소 */}
            <input 
                type="text" 
                name="addr"
                className="cs-input mt-2" 
                placeholder="기본 주소" 
                value={addressData.addr}
                readOnly
            />

            {/* 3행: 상세 주소 (직접 입력) */}
            <input 
                type="text" 
                name="detailAddr"
                className="cs-input mt-2" 
                placeholder="상세 주소를 입력하세요" 
                value={addressData.detailAddr}
                onChange={handleAddressChange}
            />
          </div>

          {/* 추가 정보 (아이디/비번) */}
          <div className="cs-group" style={{marginTop: '20px'}}>
             <label>아이디 (담당자)</label>
             <input type="text" name="username" className="cs-input" value={formData.username} onChange={handleChange} />
          </div>
          <div className="cs-group">
             <label>비밀번호</label>
             <input type="password" name="password" className="cs-input" value={formData.password} onChange={handleChange} />
          </div>

          <div className="cs-submit-area">
             <button type="submit" className="cs-submit-btn">회원가입</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CompanySignup;