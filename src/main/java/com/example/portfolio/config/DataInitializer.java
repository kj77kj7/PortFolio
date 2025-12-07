package com.example.portfolio.config;

import com.example.portfolio.job.entity.JobPost;
import com.example.portfolio.job.repository.JobPostRepository;
import com.example.portfolio.user.entity.Role;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final JobPostRepository jobPostRepository; // JobPost 저장을 위해 추가
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("이미 데이터가 존재합니다. 초기화 작업을 건너뜁니다.");
            return;
        }

        List<User> users = new ArrayList<>();
        String commonPassword = passwordEncoder.encode("!jjrudwns1");

        // 1. 모노피스 디자인 스튜디오
        User company1 = User.builder()
                .username("test")
                .password(commonPassword)
                .name("모노피스 디자인 스튜디오")
                .email("contact@monopiece.com")
                .isForeigner(false)
                .role(Role.COMPANY)
                .businessNumber("101-81-00001")
                .address("서울특별시 마포구 양화로 125, 6층 (서교동, 루프빌딩)")
                .jobGroup("디자인")
                .career("브랜드 아이덴티티/패키지 디자인 전문")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company1);

        // 2. 파인브릿지 마케팅 그룹
        User company2 = User.builder()
                .username("test1")
                .password(commonPassword)
                .name("파인브릿지 마케팅 그룹")
                .email("hr@finebridge.com")
                .isForeigner(false)
                .role(Role.COMPANY)
                .businessNumber("202-81-00002")
                .address("서울특별시 강남구 논현로 508, 12층 (역삼동, FBG타워)")
                .jobGroup("마케팅")
                .career("디지털 광고/브랜드 전략 컨설팅 전문")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company2);

        // 3. 세인트힐 헬스케어 클리닉
        User company3 = User.builder()
                .username("test2")
                .password(commonPassword)
                .name("세인트힐 헬스케어 클리닉")
                .email("recruit@sainthill.com")
                .isForeigner(false)
                .role(Role.COMPANY)
                .businessNumber("303-81-00003")
                .address("서울특별시 서초구 서초대로 314, 3층 (서초동, 세인트힐 메디컬센터)")
                .jobGroup("의료/보건")
                .career("통합 헬스케어·재활 전문")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company3);

        // 4. 오퍼레이츠 HR 컨설팅
        User company4 = User.builder()
                .username("operates")
                .password(commonPassword)
                .name("오퍼레이츠 HR 컨설팅")
                .email("info@operates.com")
                .isForeigner(false)
                .role(Role.COMPANY)
                .businessNumber("404-81-00004")
                .address("서울특별시 종로구 종로 33, 14층 (청진동, 오퍼레이츠타워)")
                .jobGroup("기획/컨설팅")
                .career("외국계 기업 인사 프로세스 구축 지원")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company4);

        // 5. 포레스트앤로지스틱스
        User company5 = User.builder()
                .username("forestlogis")
                .password(commonPassword)
                .name("포레스트앤로지스틱스")
                .email("admin@forest.com")
                .isForeigner(false)
                .role(Role.COMPANY)
                .businessNumber("505-81-00005")
                .address("경기도 안산시 단원구 풍전로 37, 2층 (고잔동, 포레스트센터)")
                .jobGroup("무역/유통")
                .career("물류창고 운영·재고관리 서비스")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company5);

        // 6. 플래너리 이벤트 그룹
        User company6 = User.builder()
                .username("plannery")
                .password(commonPassword)
                .name("플래너리 이벤트 그룹")
                .email("hello@plannery.com")
                .isForeigner(false)
                .role(Role.COMPANY)
                .businessNumber("606-81-00006")
                .address("서울특별시 성동구 아차산로 49, 8층 (성수동, 플래너리빌딩)")
                .jobGroup("서비스")
                .career("브랜드 행사/페스티벌/컨퍼런스 기획")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company6);

        // 7. 스위트홈 인테리어
        User company7 = User.builder()
                .username("sweethome")
                .password(commonPassword)
                .name("스위트홈 인테리어")
                .email("design@sweethome.com")
                .isForeigner(false)
                .role(Role.COMPANY)
                .businessNumber("707-81-00007")
                .address("인천광역시 남동구 인주대로 672, 4층 (구월동, 스위트홈빌딩)")
                .jobGroup("건설/건축")
                .career("주거·상업 공간 리모델링 전문")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company7);

        // 8. 개인 회원 (장경준)
        User jobSeeker = User.builder()
                .username("jkj77jkj")
                .password(passwordEncoder.encode("!jjrudwns1"))
                .name("장경준")
                .email("kj77kj@naver.com")
                .birthdate("2001-06-17")
                .career("신입")
                .jobGroup("개발")
                .isForeigner(false)
                .role(Role.JOB_SEEKER)
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(jobSeeker);

        // 유저 저장
        userRepository.saveAll(users);


        // ================= 구인구직 공고 데이터 생성 =================

        List<JobPost> jobPosts = new ArrayList<>();

        // 1. 모노피스 디자인 스튜디오 - 5년차 이상
        jobPosts.add(JobPost.builder()
                .company(company1)
                .title("시각/브랜딩 디자이너 경력직 채용")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("5년차 이상")
                .content("") // 공란
                .jobImages(null)
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 2. 파인브릿지 마케팅 그룹 - 신입, 1~3년차
        jobPosts.add(JobPost.builder()
                .company(company2)
                .title("퍼포먼스 마케터 신입/주니어 모집")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("신입, 1년 ~ 3년차")
                .content("") // 공란
                .jobImages(null)
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 3. 세인트힐 헬스케어 클리닉 - 3~5년차
        jobPosts.add(JobPost.builder()
                .company(company3)
                .title("원무과 행정직 및 코디네이터 채용")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("3년 ~ 5년차")
                .content("") // 공란
                .jobImages(null)
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 4. 오퍼레이츠 HR 컨설팅 - 신입
        jobPosts.add(JobPost.builder()
                .company(company4)
                .title("HR 컨설팅 어시스턴트 (채용전제형 인턴)")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("신입")
                .content("") // 공란
                .jobImages(null)
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 5. 포레스트앤로지스틱스 - 경력 무관 (다양하게)
        jobPosts.add(JobPost.builder()
                .company(company5)
                .title("물류 센터 운영 매니저 모집")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("신입, 1년 ~ 3년차, 3년 ~ 5년차")
                .content("") // 공란
                .jobImages(null)
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 6. 플래너리 이벤트 그룹 - 1~3년차
        jobPosts.add(JobPost.builder()
                .company(company6)
                .title("기업 행사 및 페스티벌 기획자")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("1년 ~ 3년차")
                .content("") // 공란
                .jobImages(null)
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 7. 스위트홈 인테리어 - 3~5년차, 5년차 이상
        jobPosts.add(JobPost.builder()
                .company(company7)
                .title("인테리어 현장 소장 및 시공 관리자")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("3년 ~ 5년차, 5년차 이상")
                .content("") // 공란
                .jobImages(null)
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 공고 저장
        jobPostRepository.saveAll(jobPosts);

        System.out.println("========== 초기 데이터(유저 + 공고) 적재 완료 ==========");
    }
}