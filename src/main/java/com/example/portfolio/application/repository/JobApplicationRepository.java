package com.example.portfolio.application.repository;

import com.example.portfolio.application.entity.JobApplication;
import com.example.portfolio.jobpost.entity.Jobpost;
import com.example.portfolio.resume.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobPost(Jobpost jobpost);

    List<JobApplication> findByResume(Resume resume);

    List<JobApplication> findByResume_User_Id(Long userId);
}
