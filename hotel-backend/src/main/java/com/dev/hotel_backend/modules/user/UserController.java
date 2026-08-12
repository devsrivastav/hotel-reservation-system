package com.dev.hotel_backend.modules.user;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(
            Authentication authentication
    ) {
        return Map.of(
                "message", "JWT authentication successful",
                "email", authentication.getName(),
                "authorities", authentication.getAuthorities()
        );
    }
}