import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CompanyMyPage.css';

const SAMPLE_TAGS = [
  "#재택근무", "#유연근무제", "#주4.5일제", "#탄력근무제", 
  "#자율출퇴근", "#칼퇴보장", "#야근없음", "#워라밸실천",
  "#자유로운연차", "#반반차사용", "#리프레시휴가", "#30분단위휴가",
  "#업계최고연봉", "#연봉상위1%", "#스톡옵션", "#인센티브", 
  "#성과급", "#명절보너스", "#야근수당", "#퇴직금별도",
  "#내일채움공제", "#청년중소기업소득세감면",
  "#수평적조직", "#자유복장", "#님/닉네임문화", "#회식강요안함",
  "#2030젊은조직", "#반려동물동반", "#자유로운의견", "#노션/슬랙사용",
  "#탑다운없는문화", "#상호존중",
  "#점심식대지원", "#저녁식대지원", "#간식무한", "#카페테리아",
  "#최신맥북지원", "#최고성능장비", "#웰컴키트", "#안마의자",
  "#수면실", "#통신비지원", "#교통비지원",
  "#도서비지원", "#교육비지원", "#세미나참가지원", "#스터디모임",
  "#해외워크샵", "#직무교육"
];

const CompanyMyPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); 
  const [user, setUser] = useState(null);
  
  // 상태 관리
  const [viewMode, setViewMode] = useState('list'); 
  const [myPosts, setMyPosts] = useState([]);
  const [tags, setTags] = useState([]);         
  const [tagInput, setTagInput] = useState(''); 
  const [suggestions, setSuggestions] = useState([]); 
  const [intro, setIntro] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    
    fetch(`http://localhost:8080/api/users/${storedUser.id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        if (data.tags && data.tags.trim() !== '') {
            setTags(data.tags.split(' ')); 
        } else {
            setTags([]);
        }
        setIntro(data.career || ''); 
        setProfileImage(data.profileImage); 
        fetchMyPosts(data.id);
      })
      .catch(err => console.error(err));
  }, [navigate]);

  const fetchMyPosts = (userId) => {
    const id = userId || user.id;
    fetch(`http://localhost:8080/api/jobs/company/${id}`)
      .then(res => res.json())
      .then(data => {
        setMyPosts(data);
        setViewMode('list');
      })
      .catch(err => console.error(err));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 태그 및 정보 저장 로직
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    if (value.trim() === '') { setSuggestions([]); return; }
    const searchKeyword = value.startsWith('#') ? value : value;
    const filtered = SAMPLE_TAGS.filter(tag => tag.includes(searchKeyword) && !tags.includes(tag));
    setSuggestions(filtered);
  };

  const addTag = (tagToAdd) => {
    if (tags.includes(tagToAdd)) { setTagInput(''); setSuggestions([]); return; }
    setTags([...tags, tagToAdd]);
    setTagInput(''); setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        const val = tagInput.trim();
        if (!val) return;
        const newTag = val.startsWith('#') ? val : `#${val}`;
        addTag(newTag);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSave = () => {
    if (!user) return;
    if (!profileImage) { alert("회사 정보 등록 시, 대표 사진 1장은 필수입니다."); return; }
    const tagsString = tags.join(' ');

    fetch(`http://localhost:8080/api/users/${user.id}/info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: tagsString, intro: intro, profileImage: profileImage })
    })
    .then(res => {
        if(res.ok) return res.json();
        throw new Error('수정 실패');
    })
    .then(updatedUser => {
        alert("저장되었습니다.");
        sessionStorage.setItem('user', JSON.stringify({ ...user, tags: updatedUser.tags, career: updatedUser.career, profileImage: updatedUser.profileImage }));
        setUser(updatedUser);
        setViewMode('list'); // 저장 후 리스트 모드로 복귀
    })
    .catch(err => alert(err.message));
  };

  const handleLogout = () => {
      sessionStorage.removeItem('user');
      navigate('/');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="mypage-container">
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
             <div style={{display:'flex', gap:'10px'}}>
                <button className="login-box-btn active" onClick={() => navigate('/mypage')}>{user.name}님</button>
                <button className="login-box-btn" onClick={handleLogout} style={{width:'100px', color:'#333'}}>로그아웃</button>
             </div>
        </div>
      </header>
      
      <div className="mp-content">
        {/* 돌아가기 링크 */}
        <div className="mp-back-link" onClick={() => navigate(-1)}>← 취소하고 돌아가기</div>

        {/* [디자인 변경] 마이페이지 헤더 영역 */}
        <div className="mp-header-box">
             <h1 className="mp-title">마이페이지</h1>
        </div>

        {/* [디자인 변경] 1. 프로필 카드 (유저 페이지 스타일 적용) */}
        <div className="mp-profile-card">
            {/* 왼쪽: 이미지 */}
            <div className="mp-profile-left">
                <div 
                    className="mp-profile-img" 
                    style={profileImage ? {backgroundImage: `url(${profileImage})`} : {backgroundColor:'#e0e0e0'}}
                    onClick={() => viewMode === 'form' && fileInputRef.current.click()}
                >
                    {/* 이미지 없을 때 + 표시 (수정모드) */}
                    {viewMode === 'form' && !profileImage && <span style={{fontSize:'30px', color:'#999'}}>+</span>}
                    
                    {/* 실제 이미지 렌더링 (배경이미지 방식 or img 태그 방식) */}
                    {profileImage && <img src={profileImage} alt="Profile" style={{width:'100%', height:'100%', objectFit:'cover'}} />}

                    <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*" onChange={handleImageChange}/>
                </div>
            </div>

            {/* 오른쪽: 정보 */}
            <div className="mp-profile-info">
                <div className="mp-info-row">
                    <span className="mp-label">기업명</span>
                    <span className="mp-value" style={{fontWeight:'bold', fontSize:'18px'}}>{user.name}</span>
                </div>
                <div className="mp-info-row">
                    <span className="mp-label">주소</span>
                    <span className="mp-value" style={{fontSize:'14px'}}>{user.address}</span>
                </div>
                <div className="mp-info-row">
                    <span className="mp-label">사업자번호</span>
                    <span className="mp-value">{user.businessNumber}</span>
                </div>
                
                {/* 정보 수정 버튼 */}
                <div className="mp-info-row" style={{marginTop:'15px'}}>
                    <button 
                        className="mp-tag-add-btn" 
                        onClick={viewMode === 'form' ? handleSave : () => setViewMode('form')}
                        style={{width:'150px'}} 
                    >
                        {viewMode === 'form' ? '저장하기' : '정보 수정하기'}
                    </button>
                    {viewMode === 'form' && (
                        <button className="mp-cancel-btn" onClick={() => setViewMode('list')} style={{marginLeft:'10px'}}>취소</button>
                    )}
                </div>
            </div>
        </div>

        {/* [디자인 변경] 2. 하단 2단 그리드 섹션 */}
        <div className="mp-grid-sections">
            
            {/* 왼쪽: 기업 키워드 (태그 관리) */}
            <section className="mp-section">
                <h3 className="mp-section-title">우리 기업 키워드 ({tags.length})</h3>
                
                {viewMode === 'form' ? (
                    // 수정 모드일 때 태그 입력창
                    <div className="tag-input-wrapper">
                        <div className="tag-input-container">
                            {tags.map((tag, index) => (
                                <div key={index} className="tag-chip">
                                    <span>{tag}</span>
                                    <button className="tag-remove-btn" onClick={() => removeTag(tag)}>×</button>
                                </div>
                            ))}
                            <input 
                                type="text" className="tag-input-field" placeholder="태그 입력"
                                value={tagInput} onChange={handleTagInputChange} onKeyDown={handleKeyDown}
                            />
                        </div>
                        {suggestions.length > 0 && (
                            <ul className="suggestion-list">
                                {suggestions.map((suggestion, idx) => (
                                    <li key={idx} onClick={() => addTag(suggestion)}>{suggestion}</li>
                                ))}
                            </ul>
                        )}
                        <p style={{fontSize:'12px', color:'#999', marginTop:'10px'}}>
                            * 수정 모드에서 태그를 추가/삭제하고 상단 '저장하기'를 눌러주세요.
                        </p>
                    </div>
                ) : (
                    // 조회 모드일 때 태그 리스트
                    <div className="tag-display-area">
                        {tags.length > 0 ? (
                            <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
                                {tags.map((tag, idx) => (
                                    <span key={idx} className="mp-badge" style={{margin:0}}>{tag}</span>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-text">등록된 키워드가 없습니다.</div>
                        )}
                    </div>
                )}
            </section>

            {/* 오른쪽: 진행중인 공고 (리스트 형태) */}
            <section className="mp-section">
                <h3 className="mp-section-title">진행중인 공고 ({myPosts.length})</h3>
                <div className="ump-post-list">
                    {myPosts.length > 0 ? (
                        myPosts.map((post) => (
                            <div 
                                key={post.id} 
                                className="ump-post-row"
                                onClick={() => navigate(`/job-detail/${post.id}`)}
                            >
                                <span className="ump-post-title-text" style={{flex:1}}>
                                    {post.title}
                                </span>
                                <span className="ump-post-date">
                                    {post.endDate} 마감
                                </span>
                                {/* 수정 버튼 (작게) */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/job-detail/${post.id}`, { state: { mode: 'edit' } }); }}
                                    style={{marginLeft:'10px', fontSize:'12px', padding:'2px 8px', border:'1px solid #ddd', borderRadius:'4px', background:'white', cursor:'pointer'}}
                                >
                                    수정
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="no-data-text no-data-box">등록된 공고가 없습니다.<br/><span style={{fontSize:'12px', fontWeight:'normal'}}>'구인구직 &gt; 글 작성' 메뉴를 이용해주세요.</span></div>
                    )}
                </div>
            </section>
        </div>

      </div>
    </div>
  );
};

export default CompanyMyPage;