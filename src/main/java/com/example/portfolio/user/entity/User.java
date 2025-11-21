package com.example.portfolio.user.entity;

import jakarta.persistence.*;
import lombok.*;

import javax.management.relation.Role;

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
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;   // JOB_SEEKER, COMPANY, WORKER

    @Column(nullable = false)
    private String createdAt;
}
