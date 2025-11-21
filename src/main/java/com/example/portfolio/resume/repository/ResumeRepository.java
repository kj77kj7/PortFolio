package com.example.portfolio.resume.repository;

import com.example.portfolio.resume.entity.Resume;
import com.example.portfolio.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUser(User user);

    List<Resume> findByIsSharedTrue();
}
