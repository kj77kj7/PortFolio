package com.example.portfolio.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String username; // email -> username 변경
    private String password;
}