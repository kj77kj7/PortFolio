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
    private final JobPostRepository jobPostRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("이미 데이터가 존재합니다. 초기화 작업을 건너뜁니다.");
            return;
        }

        List<User> users = new ArrayList<>();
        String commonPassword = passwordEncoder.encode("!jjrudwns1");

        // ================= 기업 회원 생성 (프로필 이미지 추가됨) =================

        // 1. 모노피스 디자인 스튜디오 (디자인)
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
                // [추가] 디자인 스튜디오 느낌의 로고
                .profileImage("https://picsum.photos/seed/monopiece/300/300")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company1);

        // 2. 파인브릿지 마케팅 그룹 (마케팅)
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
                // [추가] 마케팅, 그래프 느낌
                .profileImage("https://picsum.photos/seed/finebridge/300/300")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company2);

        // 3. 세인트힐 헬스케어 클리닉 (의료)
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
                // [추가] 깔끔한 병원/십자가 느낌
                .profileImage("https://picsum.photos/seed/sainthill/300/300")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company3);

        // 4. 오퍼레이츠 HR 컨설팅 (컨설팅)
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
                // [추가] 오피스 빌딩 느낌
                .profileImage("https://picsum.photos/seed/operates/300/300")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company4);

        // 5. 포레스트앤로지스틱스 (물류)
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
                // [추가] 박스, 배송 느낌
                .profileImage("https://picsum.photos/seed/forest/300/300")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company5);

        // 6. 플래너리 이벤트 그룹 (기획)
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
                // [추가] 파티, 조명 느낌
                .profileImage("https://picsum.photos/seed/plannery/300/300")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company6);

        // 7. 스위트홈 인테리어 (건축)
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
                // [추가] 집, 가구 느낌
                .profileImage("https://picsum.photos/seed/sweethome/300/300")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(company7);

        // 8. 개인 회원 (장경준) - 기존 정보 유지
        User jobSeeker = User.builder()
                .username("jkj77jkj")
                .password(passwordEncoder.encode("!jjrudwns1"))
                .name("장경준")
                .email("kj77kj@naver.com")
                .birthdate("2001-06-17")
                .career("신입")
                .jobGroup("developer")
                .isForeigner(false)
                .role(Role.JOB_SEEKER)
                // 개인회원 프로필 사진도 추가 (인물 사진)
                .profileImage("https://picsum.photos/seed/jkj77jkj/300/300")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(jobSeeker);

        User jobSeeker2 = User.builder()
                .username("junghyun")
                .password(passwordEncoder.encode("!jjrudwns1"))
                .name("오정현")
                .email("junghyun@naver.com")
                .birthdate("2002-06-10")
                .career("신입")
                .jobGroup("developer")
                .isForeigner(false)
                .role(Role.JOB_SEEKER)
                // 개인회원 프로필 사진도 추가 (인물 사진)
                .profileImage("https://picsum.photos/seed/jkj77jkj/300/300")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(jobSeeker2);

        User jobSeeker3 = User.builder()
                .username("minji03")
                .password(passwordEncoder.encode("!jjrudwns1"))
                .name("김민지")
                .email("junghyun@naver.com")
                .birthdate("2003-05-26")
                .career("신입")
                .jobGroup("developer")
                .isForeigner(false)
                .role(Role.JOB_SEEKER)
                // 개인회원 프로필 사진도 추가 (인물 사진)
                .profileImage("https://picsum.photos/seed/jkj77jkj/300/300")
                .createdAt(LocalDateTime.now().toString())
                .build();
        users.add(jobSeeker3);

        // 유저 저장
        userRepository.saveAll(users);


        // ================= 구인구직 공고 데이터 생성 (상세 이미지 추가됨) =================

        List<JobPost> jobPosts = new ArrayList<>();

        // 1. 모노피스 (디자인) - 이미지 2장
        jobPosts.add(JobPost.builder()
                .company(company1)
                .title("시각/브랜딩 디자이너 경력직 채용")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("5년차 이상")
                .content("브랜드 아이덴티티를 확립하고 시각적 언어로 풀어낼 디자이너를 찾습니다.\nAdobe Tool 능숙자 우대.")
                // [추가] 디자인 작업실, 맥북 이미지
                .jobImages("[\"https://picsum.photos/seed/design1/800/500\", \"https://picsum.photos/seed/design2/800/500\"]")
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 2. 파인브릿지 (마케팅) - 이미지 2장
        jobPosts.add(JobPost.builder()
                .company(company2)
                .title("퍼포먼스 마케터 신입/주니어 모집")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("신입, 1년 ~ 3년차")
                .content("데이터 기반의 퍼포먼스 마케팅을 경험하고 싶은 신입/주니어 마케터를 모십니다.")
                // [추가] 회의실, 그래프 이미지
                .jobImages("[\"https://picsum.photos/seed/marketing1/800/500\", \"https://picsum.photos/seed/marketing2/800/500\"]")
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 3. 세인트힐 (의료)
        jobPosts.add(JobPost.builder()
                .company(company3)
                .title("원무과 행정직 및 코디네이터 채용")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("3년 ~ 5년차")
                .content("환자 응대 및 원무 행정 업무를 담당할 친절한 분을 모십니다.")
                // [추가] 안내 데스크, 병원 내부
                .jobImages("[\"https://picsum.photos/seed/hospital1/800/500\", \"https://picsum.photos/seed/hospital2/800/500\"]")
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 4. 오퍼레이츠 (HR)
        jobPosts.add(JobPost.builder()
                .company(company4)
                .title("HR 컨설팅 어시스턴트 (채용전제형 인턴)")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("신입")
                .content("글로벌 기업의 HR 프로세스를 배우고 성장할 인턴을 모집합니다.")
                // [추가] 오피스, 서류
                .jobImages("[\"https://picsum.photos/seed/office1/800/500\", \"https://picsum.photos/seed/office2/800/500\"]")
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 5. 포레스트 (물류)
        jobPosts.add(JobPost.builder()
                .company(company5)
                .title("물류 센터 운영 매니저 모집")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("신입, 1년 ~ 3년차, 3년 ~ 5년차")
                .content("효율적인 물류 시스템 운영과 재고 관리를 담당할 매니저를 채용합니다.")
                // [추가] 창고, 지게차
                .jobImages("[\"https://picsum.photos/seed/logistics1/800/500\", \"https://picsum.photos/seed/logistics2/800/500\"]")
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 6. 플래너리 (기획)
        jobPosts.add(JobPost.builder()
                .company(company6)
                .title("기업 행사 및 페스티벌 기획자")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("1년 ~ 3년차")
                .content("창의적인 아이디어로 즐거운 행사를 만들어갈 기획자를 기다립니다.")
                // [추가] 콘서트, 행사
                .jobImages("[\"https://picsum.photos/seed/event1/800/500\", \"https://picsum.photos/seed/event2/800/500\"]")
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 7. 스위트홈 (건축)
        jobPosts.add(JobPost.builder()
                .company(company7)
                .title("인테리어 현장 소장 및 시공 관리자")
                .startDate("2025-12-01")
                .endDate("2025-12-30")
                .totalCareer("3년 ~ 5년차, 5년차 이상")
                .content("주거 및 상업 공간 인테리어 현장을 책임질 소장님을 모십니다.")
                // [추가] 인테리어, 도면
                .jobImages("[\"https://picsum.photos/seed/interior1/800/500\", \"https://picsum.photos/seed/interior2/800/500\"]")
                .createdAt(LocalDateTime.now().toString())
                .build());

        // 공고 저장
        jobPostRepository.saveAll(jobPosts);

        System.out.println("========== 초기 데이터(유저 + 공고 + 이미지) 적재 완료 ==========");
    }
}