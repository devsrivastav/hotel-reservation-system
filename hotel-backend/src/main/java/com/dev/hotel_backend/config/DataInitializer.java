package com.dev.hotel_backend.config;

import com.dev.hotel_backend.entity.Role;
import com.dev.hotel_backend.entity.RoleName;
import com.dev.hotel_backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeRoles(RoleRepository roleRepository) {

        return args -> {

            createRoleIfNotExists(
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
        };
    }

    private void createRoleIfNotExists(
            RoleRepository roleRepository,
            RoleName roleName
    ) {

        if (roleRepository.findByName(roleName).isEmpty()) {

            Role role = new Role();
            role.setName(roleName);

            roleRepository.save(role);
        }
    }
}