package com.dev.hotel_backend.modules.hotel.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateHotelRequest {

    @Size(max = 150)
    private String name;

    private String description;

    private String address;

    private String city;

    private String state;

    private String country;

    @Size(max = 10)
    private String zipCode;

    @Size(max = 15)
    private String phone;

    @Email(message = "Invalid email address")
    private String email;

    @Min(value = 1)
    @Max(value = 5)
    private Integer starRating;

    private LocalTime checkInTime;

    private LocalTime checkOutTime;
}