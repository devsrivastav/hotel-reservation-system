package com.dev.hotel_backend.modules.auth.service;

import com.dev.hotel_backend.dto.request.LoginRequest;
import com.dev.hotel_backend.dto.request.RegisterRequest;
import com.dev.hotel_backend.dto.response.AuthResponse;
import com.dev.hotel_backend.entity.Role;
import com.dev.hotel_backend.entity.RoleName;
import com.dev.hotel_backend.entity.User;
import com.dev.hotel_backend.exception.BadRequestException;
import com.dev.hotel_backend.exception.ResourceNotFoundException;
import com.dev.hotel_backend.repository.RoleRepository;
import com.dev.hotel_backend.repository.UserRepository;
import com.dev.hotel_backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Role role = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Default role not found"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .enabled(true)
                .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .message("User Registered Successfully")
                .token("token")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid Email"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid Password");
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .message("Login Successful")
                .token(token)
                .build();
    }
}