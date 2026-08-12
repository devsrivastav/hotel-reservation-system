package com.dev.hotel_backend.modules.auth.controller;
//
//import com.dev.hotel_backend.dto.request.LoginRequest;
//import com.dev.hotel_backend.dto.request.RegisterRequest;
//import com.dev.hotel_backend.dto.response.AuthResponse;
//import com.dev.hotel_backend.modules.auth.service.AuthService;
//import jakarta.validation.Valid;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/auth")
//public class AuthController {
//
//    private final AuthService authService;
//
//    public AuthController(AuthService authService) {
//        this.authService = authService;
//    }
//
//    @PostMapping("/register")
//    public ResponseEntity<AuthResponse> register(
//            @Valid @RequestBody RegisterRequest request) {
//
//        return ResponseEntity
//                .status(HttpStatus.CREATED)
//                .body(authService.register(request));
//    }
//
//    @PostMapping("/login")
//    public ResponseEntity<AuthResponse> login(
//            @Valid @RequestBody LoginRequest request) {
//
//        return ResponseEntity.ok(authService.login(request));
//    }
//}

import com.dev.hotel_backend.dto.request.LoginRequest;
import com.dev.hotel_backend.dto.request.RegisterRequest;
import com.dev.hotel_backend.dto.response.AuthResponse;
import com.dev.hotel_backend.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        AuthResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}