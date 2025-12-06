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
import MyPage from './pages/MyPage';         // [추가] 기업 마이페이지
import CompanyList from './pages/CompanyList'; // [추가] 회사정보 목록 (팝업 기능 포함)

function App() {
  return (
    <Router>
      <Routes>
        {/* 기본 경로: 홈 화면 */}
        <Route path="/" element={<Home />} />
        
        {/* 인증 관련 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/company-signup" element={<CompanySignup />} />
        
        {/* 마이페이지 & 회사 목록 (새로 추가된 기능) */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/companies" element={<CompanyList />} />

        {/* 상세 페이지 (ID 파라미터 포함) */}
        <Route path="/job-detail/:id" element={<JobPostDetail />} />
        <Route path="/company-detail/:id" element={<CompanyDetail />} />

        {/* 구인구직 관련 */}
        <Route path="/jobs" element={<JobMain />} />
        <Route path="/jobs/create" element={<JobCreate />} />
      </Routes>
    </Router>
  );
}

export default App;