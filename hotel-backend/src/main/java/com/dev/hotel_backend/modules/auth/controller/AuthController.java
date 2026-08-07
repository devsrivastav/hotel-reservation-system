package com.dev.hotel_backend.modules.auth.controller;


import com.dev.hotel_backend.dto.request.LoginRequest;
import com.dev.hotel_backend.dto.request.RegisterRequest;
import com.dev.hotel_backend.dto.response.AuthResponse;
import com.dev.hotel_backend.modules.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}