package com.dev.hotel_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        // =====================================================
        // NO TOKEN
        // =====================================================

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String jwt =
                authHeader.substring(7).trim();

        try {

            // =================================================
            // EXTRACT EMAIL
            // =================================================

            String email =
                    jwtService.extractEmail(jwt);

            System.out.println(
                    "========================================"
            );

            System.out.println(
                    "JWT REQUEST : " +
                            request.getMethod() +
                            " " +
                            request.getRequestURI()
            );

            System.out.println(
                    "JWT EMAIL   : " + email
            );

            // =================================================
            // LOAD USER
            // =================================================

            if (email != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                System.out.println(
                        "USER EMAIL  : " +
                                userDetails.getUsername()
                );

                System.out.println(
                        "AUTHORITIES : " +
                                userDetails.getAuthorities()
                );

                // =============================================
                // VALIDATE TOKEN
                // =============================================

                boolean valid =
                        jwtService.isTokenValid(
                                jwt,
                                userDetails.getUsername()
                        );

                System.out.println(
                        "TOKEN VALID : " + valid
                );

                // =============================================
                // SET AUTHENTICATION
                // =============================================

                if (valid) {

                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );

                    System.out.println(
                            "AUTHENTICATED: " +
                                    authentication
                                            .getAuthorities()
                    );
                }
            }

            System.out.println(
                    "========================================"
            );

        } catch (Exception exception) {

            System.err.println(
                    "========================================"
            );

            System.err.println(
                    "JWT AUTHENTICATION FAILED"
            );

            System.err.println(
                    "REQUEST: " +
                            request.getMethod() +
                            " " +
                            request.getRequestURI()
            );

            System.err.println(
                    "ERROR: " +
                            exception.getClass().getName()
            );

            System.err.println(
                    "MESSAGE: " +
                            exception.getMessage()
            );

            exception.printStackTrace();

            System.err.println(
                    "========================================"
            );
        }

        filterChain.doFilter(request, response);
    }
}