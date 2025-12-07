package com.example.portfolio.resume.service;

import com.example.portfolio.resume.entity.Resume;
import com.example.portfolio.resume.repository.ResumeRepository;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    // 이력서 생성 + 유저 정보 동기화
    @Transactional
    public Resume createResume(Long userId, String title, String profileImage, String jobGroup, String career, String links, String selfIntro, boolean isShared) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저 없음"));

        // [핵심] 이력서에 입력한 사진과 정보를 유저 테이블에도 저장 (마이페이지 연동)
        user.setProfileImage(profileImage);
        user.setJobGroup(jobGroup);
        user.setCareer(career);
        userRepository.save(user);

        Resume resume = Resume.builder()
                .user(user)
                .title(title)
                .profileImage(profileImage)
                .jobGroup(jobGroup)
                .career(career)
                .links(links)
                .selfIntro(selfIntro)
                .isShared(isShared)
                .createdAt(LocalDateTime.now().toString())
                .updatedAt(LocalDateTime.now().toString())
                .build();
        return resumeRepository.save(resume);
    }

    // 이력서 수정 + 유저 정보 동기화
    @Transactional
    public Resume updateResume(Long resumeId, String title, String profileImage, String jobGroup, String career, String links, String selfIntro, boolean isShared) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("이력서 없음"));

        // [핵심] 수정 시에도 유저 정보 업데이트
        User user = resume.getUser();
        user.setProfileImage(profileImage);
        user.setJobGroup(jobGroup);
        user.setCareer(career);
        userRepository.save(user);

        resume.setTitle(title);
        resume.setProfileImage(profileImage);
        resume.setJobGroup(jobGroup);
        resume.setCareer(career);
        resume.setLinks(links);
        resume.setSelfIntro(selfIntro);
        resume.setShared(isShared);
        resume.setUpdatedAt(LocalDateTime.now().toString());
        return resumeRepository.save(resume);
    }

    public void deleteResume(Long resumeId) {
        resumeRepository.deleteById(resumeId);
    }

    public Resume getResume(Long resumeId) {
        return resumeRepository.findById(resumeId).orElseThrow(() -> new RuntimeException("이력서 없음"));
    }

    public List<Resume> getResumesByUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("유저 없음"));
        return resumeRepository.findByUser(user);
    }

    public List<Resume> getSharedResumes() {
        return resumeRepository.findByIsSharedTrue();
    }
}