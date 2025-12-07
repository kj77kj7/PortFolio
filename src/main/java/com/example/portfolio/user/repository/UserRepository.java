package com.example.portfolio.user.repository;

import com.example.portfolio.user.entity.Role;
import com.example.portfolio.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username); // 아이디로 조회

    // 사업자 번호로 조회
    Optional<User> findByBusinessNumber(String businessNumber);
    List<User> findByRole(Role role);
}