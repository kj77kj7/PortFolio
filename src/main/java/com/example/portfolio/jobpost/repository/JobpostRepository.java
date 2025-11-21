package com.example.portfolio.jobpost.repository;

import com.example.portfolio.jobpost.entity.Jobpost;
import com.example.portfolio.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobpostRepository extends JpaRepository<Jobpost, Long> {

    List<Jobpost> findByCompany(User company);
}
