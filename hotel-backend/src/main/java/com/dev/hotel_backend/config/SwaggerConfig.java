package com.dev.hotel_backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI hotelOpenAPI() {

        return new OpenAPI()
                .info(new Info()
                        .title("Hotel Reservation System API")
                        .version("1.0")
                        .description("Spring Boot Hotel Reservation Backend")
                        .contact(new Contact()
                                .name("Dev Srivastav")
                                .email("your-email@example.com")));
    }
}
