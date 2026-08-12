package com.dev.hotel_backend.modules.auth.service;
//
//import com.dev.hotel_backend.dto.request.LoginRequest;
//import com.dev.hotel_backend.dto.request.RegisterRequest;
//import com.dev.hotel_backend.dto.response.AuthResponse;
//import com.dev.hotel_backend.entity.Role;
//import com.dev.hotel_backend.entity.RoleName;
//import com.dev.hotel_backend.entity.User;
//import com.dev.hotel_backend.exception.UserAlreadyExistsException;
//import com.dev.hotel_backend.modules.auth.service.AuthService;
//import com.dev.hotel_backend.repository.RoleRepository;
//import com.dev.hotel_backend.repository.UserRepository;
//import com.dev.hotel_backend.security.JwtService;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//@Service
//public class AuthServiceImpl implements AuthService {
//
//    private final UserRepository userRepository;
//    private final RoleRepository roleRepository;
//    private final PasswordEncoder passwordEncoder;
//    private final AuthenticationManager authenticationManager;
//    private final JwtService jwtService;
//
//    public AuthServiceImpl(
//            UserRepository userRepository,
//            RoleRepository roleRepository,
//            PasswordEncoder passwordEncoder,
//            AuthenticationManager authenticationManager,
//            JwtService jwtService
//    ) {
//        this.userRepository = userRepository;
//        this.roleRepository = roleRepository;
//        this.passwordEncoder = passwordEncoder;
//        this.authenticationManager = authenticationManager;
//        this.jwtService = jwtService;
//    }
//
//    @Override
//    public AuthResponse register(RegisterRequest request) {
//
//        String email = request.getEmail().trim().toLowerCase();
//
//        if (userRepository.existsByEmail(email)) {
//            throw new UserAlreadyExistsException(
//                    "User with this email already exists"
//            );
//        }
//
//        if (userRepository.existsByPhone(request.getPhone())) {
//            throw new UserAlreadyExistsException(
//                    "User with this phone number already exists"
//            );
//        }
//
//        Role customerRole = roleRepository
//                .findByName(RoleName.ROLE_CUSTOMER)
//                .orElseThrow(() ->
//                        new RuntimeException("Customer role not found")
//                );
//
//        User user = User.builder()
//                .firstName(request.getFirstName().trim())
//                .lastName(request.getLastName().trim())
//                .email(email)
//                .password(passwordEncoder.encode(request.getPassword()))
//                .phone(request.getPhone().trim())
//                .enabled(true)
//                .role(customerRole)
//                .build();
//
//        userRepository.save(user);
//
//        return AuthResponse.builder()
//                .token(null)
//                .message("User registered successfully")
//                .email(user.getEmail())
//                .role(user.getRole().getName().name())
//                .build();
//    }
//
//    @Override
//    public AuthResponse login(LoginRequest request) {
//
//        String email = request.getEmail().trim().toLowerCase();
//
//        Authentication authentication =
//                authenticationManager.authenticate(
//                        new UsernamePasswordAuthenticationToken(
//                                email,
//                                request.getPassword()
//                        )
//                );
//
//        UserDetails userDetails =
//                (UserDetails) authentication.getPrincipal();
//
//        String token = jwtService.generateToken(userDetails);
//
//        User user = userRepository
//                .findByEmail(email)
//                .orElseThrow(() ->
//                        new RuntimeException("User not found")
//                );
//
//        return AuthResponse.builder()
//                .token(token)
//                .message("Login successful")
//                .email(user.getEmail())
//                .role(user.getRole().getName().name())
//                .build();
//    }
//}
import com.dev.hotel_backend.dto.request.LoginRequest;
import com.dev.hotel_backend.dto.request.RegisterRequest;
import com.dev.hotel_backend.dto.response.AuthResponse;
import com.dev.hotel_backend.entity.Role;
import com.dev.hotel_backend.entity.RoleName;
import com.dev.hotel_backend.entity.User;
import com.dev.hotel_backend.exception.UserAlreadyExistsException;
import com.dev.hotel_backend.repository.RoleRepository;
import com.dev.hotel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.dev.hotel_backend.security.JwtService;
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();
        String phone = request.getPhone().trim();

        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(
                    "User with this email already exists"
            );
        }

        if (userRepository.existsByPhone(phone)) {
            throw new UserAlreadyExistsException(
                    "User with this phone number already exists"
            );
        }

        Role customerRole = roleRepository
                .findByName(RoleName.ROLE_CUSTOMER)
                .orElseThrow(() ->
                        new RuntimeException("Customer role not found")
                );

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(phone)
                .enabled(true)
                .role(customerRole)
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .message("User registered successfully")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(
                request.getEmail().trim().toLowerCase()
        ).orElseThrow(() ->
                new RuntimeException("Invalid email or password")
        );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("User account is disabled");
        }

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .message("Login successful")
                .build();
    }
}