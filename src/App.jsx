import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompanySignup from './pages/CompanySignup';
import JobPostDetail from './pages/JobPostDetail';
import CompanyDetail from './pages/CompanyDetail';
import JobMain from './pages/JobMain';
import JobCreate from './pages/JobCreate';
import CompanyList from './pages/CompanyList';
import ResumeCreate from './pages/ResumeCreate';
import CommunityMain from './pages/CommunityMain';
import CommunityWrite from './pages/CommunityWrite';
import CommunityDetail from './pages/CommunityDetail'; // [추가
import ResumeDetail from './pages/ResumeDetail'; // 경로에 맞게 수정

// [중요] 아래 경로를 'CompanyMyPage'가 아니라 'MyPage'로 바꿔야 분기 처리가 됩니다.
import MyPage from './pages/MyPage'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* 인증 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/company-signup" element={<CompanySignup />} />
        
        {/* [중요] 마이페이지 경로 */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/companies" element={<CompanyList />} />

        {/* 상세 페이지 */}
        <Route path="/job-detail/:id" element={<JobPostDetail />} />
        <Route path="/company-detail/:id" element={<CompanyDetail />} />

        {/* 구인구직 */}
        <Route path="/jobs" element={<JobMain />} />
        <Route path="/jobs/create" element={<JobCreate />} />

        {/* 이력서 작성 */}
        <Route path="/resumes/create" element={<ResumeCreate />} />


        {/* [추가] 커뮤니티 라우트 */}
        <Route path="/community" element={<CommunityMain />} />
        <Route path="/community/write" element={<CommunityWrite />} />

        {/* [추가] 커뮤니티 상세 경로 */}
        <Route path="/community/:id" element={<CommunityDetail />} />

        <Route path="/resumes/:id" element={<ResumeDetail />} />

      </Routes>
    </Router>
  );
}

export default App;