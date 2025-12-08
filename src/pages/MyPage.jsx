import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyMyPage from './CompanyMyPage'; // [수정] 같은 pages 폴더 안에 있으므로 경로 수정
import UserMyPage from './UserMyPage';       // [수정] 같은 pages 폴더 안에 있으므로 경로 수정

const MyPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState(null);

    useEffect(() => {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate('/login');
        } else {
            setRole(user.role);
        }
    }, [navigate]);

    if (!role) return null;

    return (
        <>
            {/* ROLE이 COMPANY면 기업페이지, 아니면(JOB_SEEKER) 유저페이지 렌더링 */}
            {role === 'COMPANY' ? <CompanyMyPage /> : <UserMyPage />}
        </>
    );
};

export default MyPage;