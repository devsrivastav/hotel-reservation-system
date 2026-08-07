package com.dev.hotel_backend.modules.hotel.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateHotelRequest {

    @NotBlank
    private String name;

    private String description;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String country;

    private String zipCode;

    private String phone;

    @Email
    private String email;

    @Min(1)
    @Max(5)
    private Integer starRating;

    private LocalTime checkInTime;

    private LocalTime checkOutTime;
}
