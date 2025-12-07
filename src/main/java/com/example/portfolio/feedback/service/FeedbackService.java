package com.example.portfolio.feedback.service;

import com.example.portfolio.feedback.entity.Feedback;
import com.example.portfolio.feedback.repository.FeedbackRepository;
import com.example.portfolio.resume.entity.Resume;
import com.example.portfolio.resume.repository.ResumeRepository;
import com.example.portfolio.user.entity.Role;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    /**
     * 피드백 작성 (직장인만 가능)
     */
    public Feedback writeFeedback(Long workerUserId, Long resumeId, String comment) {

        // 작성자 확인
        User worker = userRepository.findById(workerUserId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        // 직장인 계정인지 확인
        if (worker.getRole() != Role.WORKER) {
            throw new RuntimeException("직장인 계정만 이력서 피드백을 작성할 수 있습니다.");
        }

        // 이력서 조회
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 이력서입니다."));

        Feedback feedback = Feedback.builder()
                .worker(worker)
                .resume(resume)
                .comment(comment)
                .createdAt(LocalDateTime.now().toString())
                .build();

        return feedbackRepository.save(feedback);
    }

    /**
     * 특정 이력서에 대한 피드백 목록 조회
     */
    public List<Feedback> getFeedbacksByResume(Long resumeId) {

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 이력서입니다."));

        return feedbackRepository.findByResume(resume);
    }

    /**
     * 특정 직장인의 피드백 목록 조회
     */
    public List<Feedback> getFeedbacksByWorker(Long workerUserId) {

        User worker = userRepository.findById(workerUserId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));

        return feedbackRepository.findByWorker(worker);
    }
}
