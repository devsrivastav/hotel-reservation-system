package com.dev.hotel_backend.security;

import com.dev.hotel_backend.entity.User;
import com.dev.hotel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found: " + email
                        )
                );

        // =====================================================
        // GET USER ROLE
        // =====================================================

        if (user.getRole() == null ||
                user.getRole().getName() == null) {

            throw new UsernameNotFoundException(
                    "User role is not assigned: " + email
            );
        }

        String roleName =
                user.getRole()
                        .getName()
                        .name();

        // =====================================================
        // NORMALIZE ROLE
        // =====================================================

        roleName =
                roleName
                        .replace("ROLE_", "")
                        .toUpperCase();

        String authority =
                "ROLE_" + roleName;

        // =====================================================
        // DEBUG
        // =====================================================

        System.out.println(
                "========================================"
        );

        System.out.println(
                "LOGIN USER : " + user.getEmail()
        );

        System.out.println(
                "USER ROLE  : " + roleName
        );

        System.out.println(
                "AUTHORITY  : " + authority
        );

        System.out.println(
                "========================================"
        );

        // =====================================================
        // USER DETAILS
        // =====================================================

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(
                        List.of(
                                new SimpleGrantedAuthority(
                                        authority
                                )
                        )
                )
                .disabled(!user.isEnabled())
                .build();
    }
}