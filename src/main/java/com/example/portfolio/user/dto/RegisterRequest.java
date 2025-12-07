package com.example.portfolio.user.dto;

import com.example.portfolio.user.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String username;
    private String password;
    private String name;
    private boolean isForeigner; // 필드 추가
    private String email;
    private String birthdate;
    private String career;
    private String jobGroup;
    private Role role;
    private String businessNumber; // 추가
    private String address;
}