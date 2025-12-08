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
  const fileInputRef = useRef(null); // [추가] 파일 입력 참조
  const [user, setUser] = useState(null);
  
  const [viewMode, setViewMode] = useState('list'); 
  const [myPosts, setMyPosts] = useState([]);

  // 상태 관리
  const [tags, setTags] = useState([]);         
  const [tagInput, setTagInput] = useState(''); 
  const [suggestions, setSuggestions] = useState([]); 
  const [intro, setIntro] = useState('');
  
  // [추가] 프로필 이미지 상태
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
        setProfileImage(data.profileImage); // 이미지 로드

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

  // [추가] 이미지 업로드 핸들러
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

  // 태그 로직
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);

    if (value.trim() === '') {
        setSuggestions([]);
        return;
    }
    const searchKeyword = value.startsWith('#') ? value : value;
    const filtered = SAMPLE_TAGS.filter(tag => 
        tag.includes(searchKeyword) && !tags.includes(tag)
    );
    setSuggestions(filtered);
  };

  const addTag = (tagToAdd) => {
    if (tags.includes(tagToAdd)) {
        setTagInput('');
        setSuggestions([]);
        return;
    }
    setTags([...tags, tagToAdd]);
    setTagInput('');
    setSuggestions([]);
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

    // [수정] 필수 이미지 검사 (최소 1장)
    if (!profileImage) {
        alert("회사 정보 등록 시, 대표 사진 1장은 필수입니다.");
        return;
    }

    const tagsString = tags.join(' ');

    // [수정] 이미지(profileImage)도 함께 전송
    fetch(`http://localhost:8080/api/users/${user.id}/info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          tags: tagsString, 
          intro: intro,
          profileImage: profileImage 
      })
    })
    .then(res => {
        if(res.ok) return res.json();
        throw new Error('수정 실패');
    })
    .then(updatedUser => {
        alert("저장되었습니다.");
        // 세션 정보 갱신
        sessionStorage.setItem('user', JSON.stringify({ 
            ...user, 
            tags: updatedUser.tags, 
            career: updatedUser.career,
            profileImage: updatedUser.profileImage
        }));
        setUser(updatedUser);
    })
    .catch(err => alert(err.message));
  };

  const getThumbnail = (jsonImages) => {
    try {
        const parsed = JSON.parse(jsonImages);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch { return null; }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="mypage-container">
      <header className="mp-header">
         <h1 className="logo-text" onClick={() => navigate('/')} style={{cursor:'pointer'}}>커리어친구들</h1>
      </header>
      
      <div className="mp-back-link" onClick={() => navigate('/')}>
         ← 취소하고 돌아가기
      </div>

      <div className="mp-content">
        
        {/* 프로필 이미지 표시 영역 */}
        <div 
            className="mp-profile-img-box" 
            style={profileImage ? {backgroundImage: `url(${profileImage})`, backgroundSize:'cover'} : {display:'flex', justifyContent:'center', alignItems:'center', cursor: viewMode === 'form' ? 'pointer' : 'default'}}
            onClick={() => viewMode === 'form' && fileInputRef.current.click()}
        >
            {/* 수정 모드일 때만 안내 메시지 표시 */}
            {viewMode === 'form' && !profileImage && <span style={{color:'#666'}}>+ 대표 사진 등록 (필수)</span>}
            
            {/* 파일 입력 (숨김) */}
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{display:'none'}} 
                accept="image/*"
                onChange={handleImageChange}
            />
        </div>

        <div className="mp-profile-info">
            <h2>[ {user.name} ]</h2>
            <p>{user.address}</p>
        </div>

        <button 
            className="mp-check-btn" 
            onClick={viewMode === 'form' ? () => fetchMyPosts(user.id) : () => setViewMode('form')}
        >
            {viewMode === 'form' ? '내가 쓴 글 확인' : '정보 수정하기'}
        </button>

        {viewMode === 'form' ? (
            <div className="mp-form-area">
                <div className="tag-section">
                    <label className="tag-label">우리 회사의 키워드는? (자동완성 지원)</label>
                    <div className="tag-input-container">
                        {tags.map((tag, index) => (
                            <div key={index} className="tag-chip">
                                <span>{tag}</span>
                                <button className="tag-remove-btn" onClick={() => removeTag(tag)}>×</button>
                            </div>
                        ))}
                        <input 
                            type="text" 
                            className="tag-input-field"
                            placeholder="태그 입력 후 Enter"
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    {suggestions.length > 0 && (
                        <ul className="suggestion-list">
                            {suggestions.map((suggestion, idx) => (
                                <li key={idx} onClick={() => addTag(suggestion)}>
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <textarea 
                    className="mp-textarea-intro"
                    placeholder="회사에 대한 간단한 소개를 작성해주세요."
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                ></textarea>

                <div className="mp-save-area">
                    <button className="mp-save-btn" onClick={handleSave}>저장</button>
                </div>
            </div>
        ) : (
            <div className="mp-list-area">
                {myPosts.length === 0 ? (
                    <div className="no-posts-msg">아직 작성한 글이 없습니다.</div>
                ) : (
                    myPosts.map(post => {
                        const thumb = getThumbnail(post.jobImages);
                        return (
                            <div key={post.id} className="mp-post-item" onClick={() => navigate(`/job-detail/${post.id}`)}>
                                <div className="mp-post-img">
                                    {thumb ? <img src={thumb} alt="post" /> : <div className="gray-box-sm"></div>}
                                </div>
                                <div className="mp-post-text" style={{flex:1}}>
                                    <h3>{post.title}</h3>
                                    <p>{post.companyName}</p>
                                    <span>{post.startDate} ~ {post.endDate}</span>
                                </div>
                                <div style={{display:'flex', alignItems:'center', marginLeft:'10px'}}>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            navigate(`/job-detail/${post.id}`, { state: { mode: 'edit' } });
                                        }}
                                        style={{
                                            padding:'8px 16px',
                                            backgroundColor:'#f0f0f0',
                                            border:'1px solid #ccc',
                                            borderRadius:'4px',
                                            cursor:'pointer',
                                            fontWeight:'bold',
                                            fontSize: '14px'
                                        }}
                                    >
                                        수정
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default CompanyMyPage;