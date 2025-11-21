package com.example.portfolio.feedback.repository;

import com.example.portfolio.feedback.entity.Feedback;
import com.example.portfolio.resume.entity.Resume;
import com.example.portfolio.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByResume(Resume resume);

    List<Feedback> findByWorker(User worker);
}
