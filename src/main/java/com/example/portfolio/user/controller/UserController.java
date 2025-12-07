package com.example.portfolio.user.controller;

import com.example.portfolio.user.dto.LoginRequest;
import com.example.portfolio.user.dto.RegisterRequest;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import com.example.portfolio.user.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.portfolio.user.entity.Role;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            userService.register(request);
            return ResponseEntity.ok("회원가입이 완료되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // [수정] 로그인 시 프로필 사진(profileImage)도 함께 반환
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        User user = userService.findByUsername(loginRequest.getUsername());

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 일치하지 않습니다.");
        }

        session.setAttribute("user", user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("name", user.getName());
        response.put("role", user.getRole());
        response.put("career", user.getCareer());      // 경력 추가
        response.put("jobGroup", user.getJobGroup());  // 직군 추가
        response.put("profileImage", user.getProfileImage()); // [핵심] 사진 데이터 추가

        return ResponseEntity.ok(response);
    }

    @GetMapping("/companies")
    public ResponseEntity<List<User>> getAllCompanies() {
        List<User> companies = userRepository.findByRole(Role.COMPANY);
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserDetail(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/info")
    public ResponseEntity<?> updateCompanyInfo(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String tags = payload.get("tags");
        String intro = payload.get("intro");
        User updatedUser = userService.updateCompanyInfo(id, tags, intro);
        return ResponseEntity.ok(updatedUser);
    }
}