package com.example.portfolio.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    private boolean isForeigner;

    @Column(nullable = false)
    private String email;

    private String birthdate;
    private String career;
    private String jobGroup;

    // [추가] 마이페이지 프로필 사진용
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String createdAt;

    @Column(unique = true)
    private String businessNumber;

    @Column(columnDefinition = "TEXT")
    private String tags;

    private String address;
}