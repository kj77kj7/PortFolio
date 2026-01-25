package com.example.portfolio.resume.service;

import com.example.portfolio.resume.entity.Resume;
import com.example.portfolio.resume.repository.ResumeRepository;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    // 유저별 이력서 조회
    public List<Resume> getResumesByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return resumeRepository.findByUser(user);
    }

    // 상세 조회
    public Resume getResume(Long resumeId) {
        return resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("이력서를 찾을 수 없습니다."));
    }

    // 이력서 생성
    @Transactional
    public void createResume(Long userId, String title, String profileImage, String jobGroup,
                             String career, String links, String selfIntro, String customSections, boolean isShared) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Resume resume = Resume.builder()
                .user(user)
                .title(title)
                .profileImage(profileImage)
                .jobGroup(jobGroup)
                .career(career)
                .links(links)
                .selfIntro(selfIntro)
                .customSections(customSections) // [추가]
                .isShared(isShared)
                .build();

        resumeRepository.save(resume);
    }

    // 이력서 수정
    @Transactional
    public void updateResume(Long resumeId, String title, String profileImage, String jobGroup,
                             String career, String links, String selfIntro, String customSections, boolean isShared) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new IllegalArgumentException("이력서를 찾을 수 없습니다."));

        resume.setTitle(title);
        resume.setProfileImage(profileImage);
        resume.setJobGroup(jobGroup);
        resume.setCareer(career);
        resume.setLinks(links);
        resume.setSelfIntro(selfIntro);
        resume.setCustomSections(customSections); // [추가]
        resume.setShared(isShared);

        resumeRepository.save(resume);
    }
}