import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MyPage.css';

// [수정] 요즘 채용 트렌드를 반영한 추천 태그 목록 (총 45개)
const SAMPLE_TAGS = [
  // 1. 근무 형태 & 워라밸
  "#재택근무", "#유연근무제", "#주4.5일제", "#탄력근무제", 
  "#자율출퇴근", "#칼퇴보장", "#야근없음", "#워라밸실천",
  "#자유로운연차", "#반반차사용", "#리프레시휴가", "#30분단위휴가",

  // 2. 급여 & 보상
  "#업계최고연봉", "#연봉상위1%", "#스톡옵션", "#인센티브", 
  "#성과급", "#명절보너스", "#야근수당", "#퇴직금별도",
  "#내일채움공제", "#청년중소기업소득세감면",

  // 3. 조직 문화 & 분위기
  "#수평적조직", "#자유복장", "#님/닉네임문화", "#회식강요안함",
  "#2030젊은조직", "#반려동물동반", "#자유로운의견", "#노션/슬랙사용",
  "#탑다운없는문화", "#상호존중",

  // 4. 식사 & 생활 지원
  "#점심식대지원", "#저녁식대지원", "#간식무한", "#카페테리아",
  "#최신맥북지원", "#최고성능장비", "#웰컴키트", "#안마의자",
  "#수면실", "#통신비지원", "#교통비지원",

  // 5. 성장 & 자기계발
  "#도서비지원", "#교육비지원", "#세미나참가지원", "#스터디모임",
  "#해외워크샵", "#직무교육"
];

const MyPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // 뷰 모드: 'form' (입력화면) | 'list' (내가 쓴 글)
  const [viewMode, setViewMode] = useState('form');
  const [myPosts, setMyPosts] = useState([]);

  // --- 태그 및 정보 관련 상태 ---
  const [tags, setTags] = useState([]);         // 선택된 태그 배열
  const [tagInput, setTagInput] = useState(''); // 입력창 값
  const [suggestions, setSuggestions] = useState([]); // 추천 태그 목록
  const [intro, setIntro] = useState('');       // 회사 소개

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    if (!storedUser) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    
    // 유저 정보 Fetch (최신 데이터 로드)
    fetch(`http://localhost:8080/api/users/${storedUser.id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        
        // DB의 문자열("#태그1 #태그2")을 배열로 변환
        if (data.tags && data.tags.trim() !== '') {
            setTags(data.tags.split(' ')); 
        } else {
            setTags([]);
        }
        
        setIntro(data.career || ''); // career 필드를 소개글로 사용
      })
      .catch(err => console.error(err));
  }, [navigate]);

  // 내가 쓴 공고 가져오기
  const fetchMyPosts = () => {
    if (!user) return;
    fetch(`http://localhost:8080/api/jobs/company/${user.id}`)
      .then(res => res.json())
      .then(data => {
        setMyPosts(data);
        setViewMode('list');
      })
      .catch(err => console.error(err));
  };

  // --- 태그 로직 시작 ---

  // 1. 입력값 변경 및 추천 검색
  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);

    if (value.trim() === '') {
        setSuggestions([]);
        return;
    }

    // '#' 없이 검색해도 찾을 수 있도록 처리
    const searchKeyword = value.startsWith('#') ? value : value;
    
    // 검색어 포함 + 이미 추가된 태그 제외하고 필터링
    const filtered = SAMPLE_TAGS.filter(tag => 
        tag.includes(searchKeyword) && !tags.includes(tag)
    );
    setSuggestions(filtered);
  };

  // 2. 태그 추가
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

  // 3. 키보드 이벤트 (엔터 키)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // 폼 제출 방지 (줄바꿈 방지)
        const val = tagInput.trim();
        if (!val) return;

        // 직접 입력 시 '#' 없으면 자동으로 붙여줌
        const newTag = val.startsWith('#') ? val : `#${val}`;
        addTag(newTag);
    }
  };

  // 4. 태그 삭제
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // --- 태그 로직 끝 ---

  // 저장 버튼 핸들러
  const handleSave = () => {
    if (!user) return;
    
    // 배열을 다시 공백 구분 문자열로 변환하여 전송
    const tagsString = tags.join(' ');

    fetch(`http://localhost:8080/api/users/${user.id}/info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: tagsString, intro })
    })
    .then(res => {
        if(res.ok) return res.json();
        throw new Error('수정 실패');
    })
    .then(updatedUser => {
        alert("저장되었습니다.");
        // 세션 스토리지 정보도 최신화
        sessionStorage.setItem('user', JSON.stringify({ 
            ...user, 
            tags: updatedUser.tags, 
            career: updatedUser.career 
        }));
    })
    .catch(err => alert(err.message));
  };

  // 이미지 JSON 파싱 헬퍼
  const getThumbnail = (jsonImages) => {
    try {
        const parsed = JSON.parse(jsonImages);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch { return null; }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="mypage-container">
      {/* 헤더 */}
      <header className="mp-header">
         <h1 className="logo-text" onClick={() => navigate('/')} style={{cursor:'pointer'}}>커리어친구들</h1>
      </header>
      
      <div className="mp-back-link" onClick={() => navigate('/')}>
         ← 취소하고 돌아가기
      </div>

      <div className="mp-content">
        {/* 상단 프로필 영역 */}
        <div className="mp-profile-img-box"></div>
        <div className="mp-profile-info">
            <h2>[ {user.name} ]</h2>
            <p>{user.address}</p>
        </div>

        {/* 탭 전환 버튼 */}
        <button 
            className="mp-check-btn" 
            onClick={viewMode === 'form' ? fetchMyPosts : () => setViewMode('form')}
        >
            {viewMode === 'form' ? '내가 쓴 글 확인' : '정보 수정하기'}
        </button>

        {viewMode === 'form' ? (
            /* --- 정보 수정 모드 (태그 + 소개글) --- */
            <div className="mp-form-area">
                
                {/* 태그 입력 박스 영역 */}
                <div className="tag-section">
                    <label className="tag-label">우리 회사의 키워드는? (자동완성 지원)</label>
                    <div className="tag-input-container">
                        {/* 선택된 태그들 (Chips) */}
                        {tags.map((tag, index) => (
                            <div key={index} className="tag-chip">
                                <span>{tag}</span>
                                <button className="tag-remove-btn" onClick={() => removeTag(tag)}>×</button>
                            </div>
                        ))}
                        
                        {/* 입력창 */}
                        <input 
                            type="text"
                            className="tag-input-field"
                            placeholder="태그 입력 후 Enter"
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    
                    {/* 추천 목록 (드롭다운) */}
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

                {/* 회사 소개 입력 */}
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
            /* --- 내가 쓴 글 리스트 모드 --- */
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
                                <div className="mp-post-text">
                                    <h3>{post.title}</h3>
                                    <p>{post.companyName}</p>
                                    <span>{post.startDate} ~ {post.endDate}</span>
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

export default MyPage;