package com.example.portfolio.user.service;

import com.example.portfolio.user.dto.RegisterRequest;
import com.example.portfolio.user.entity.Role;
import com.example.portfolio.user.entity.User;
import com.example.portfolio.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
    private static final String PASSWORD_PATTERN = "^(?=.*[A-Za-z])(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,15}$";

    public User register(RegisterRequest request) {
        if (request.getUsername().length() < 6 || request.getUsername().length() > 15) {
            throw new RuntimeException("아이디는 6자 이상 15자 이하여야 합니다.");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("이미 사용 중인 아이디입니다.");
        }
        if (!Pattern.matches(PASSWORD_PATTERN, request.getPassword())) {
            throw new RuntimeException("비밀번호는 영문자와 특수문자를 반드시 포함하여 8~15자여야 합니다.");
        }
        if (!Pattern.matches(EMAIL_PATTERN, request.getEmail())) {
            throw new RuntimeException("올바른 이메일 형식이 아닙니다.");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }
        if (request.getRole() == Role.COMPANY) {
            if (userRepository.findByBusinessNumber(request.getBusinessNumber()).isPresent()) {
                throw new RuntimeException("이미 가입 되어있는 회사입니다.");
            }
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .isForeigner(request.isForeigner())
                .email(request.getEmail())
                .birthdate(request.getBirthdate())
                .career(request.getCareer())
                .jobGroup(request.getJobGroup())
                .businessNumber(request.getBusinessNumber())
                .address(request.getAddress())
                .role(request.getRole())
                .createdAt(LocalDateTime.now().toString())
                .build();

        return userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자입니다."));
    }

    // [수정] 프로필 이미지도 업데이트하도록 파라미터 추가
    @Transactional
    public User updateCompanyInfo(Long userId, String tags, String intro, String profileImage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (user.getRole() != Role.COMPANY) {
            throw new RuntimeException("기업 회원만 정보를 수정할 수 있습니다.");
        }

        user.setTags(tags);
        user.setCareer(intro); // 기존 career 필드를 소개글로 사용
        user.setProfileImage(profileImage); // [추가] 이미지 저장

        return userRepository.save(user);
    }
}