package com.dev.hotel_backend.modules.auth.service;
import com.dev.hotel_backend.modules.auth.service.AuthService;
import com.dev.hotel_backend.dto.request.LoginRequest;
import com.dev.hotel_backend.dto.request.RegisterRequest;
import com.dev.hotel_backend.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
