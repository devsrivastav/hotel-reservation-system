package com.dev.hotel_backend.config;

import com.dev.hotel_backend.entity.Role;
import com.dev.hotel_backend.entity.RoleName;
import com.dev.hotel_backend.entity.User;
import com.dev.hotel_backend.repository.RoleRepository;
import com.dev.hotel_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            // ==========================================
            // CREATE ROLES
            // ==========================================

            Role superAdminRole = createRoleIfNotExists(
                    roleRepository,
                    RoleName.ROLE_SUPER_ADMIN
            );

            createRoleIfNotExists(
                    roleRepository,
                    RoleName.ROLE_ADMIN
            );

            createRoleIfNotExists(
                    roleRepository,
                    RoleName.ROLE_CUSTOMER
            );

            // ==========================================
            // CREATE DEFAULT SUPER ADMIN
            // ==========================================

            createSuperAdminIfNotExists(
                    userRepository,
                    superAdminRole,
                    passwordEncoder
            );
        };
    }

    private Role createRoleIfNotExists(
            RoleRepository roleRepository,
            RoleName roleName
    ) {

        return roleRepository
                .findByName(roleName)
                .orElseGet(() -> {

                    Role role = new Role();
                    role.setName(roleName);

                    return roleRepository.save(role);
                });
    }

    private void createSuperAdminIfNotExists(
            UserRepository userRepository,
            Role superAdminRole,
            PasswordEncoder passwordEncoder
    ) {

        String adminEmail = "admin@hotel.com";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {

            User admin = new User();

            admin.setFirstName("Super");
            admin.setLastName("Admin");

            admin.setEmail(adminEmail);

            admin.setPassword(
                    passwordEncoder.encode("Admin@123")
            );

            admin.setPhone("9999999999");

            admin.setEnabled(true);

            admin.setRole(superAdminRole);

            userRepository.save(admin);

            System.out.println(
                    "========================================"
            );

            System.out.println(
                    "DEFAULT SUPER ADMIN CREATED"
            );

            System.out.println(
                    "Email: admin@hotel.com"
            );

            System.out.println(
                    "Password: Admin@123"
            );

            System.out.println(
                    "Role: ROLE_SUPER_ADMIN"
            );

            System.out.println(
                    "========================================"
            );
        }
    }
}