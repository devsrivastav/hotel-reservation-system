package com.dev.hotel_backend.modules.hotel.dto.request;
//
//import jakarta.validation.constraints.*;
//import lombok.*;
//
//import java.time.LocalTime;
//
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class CreateHotelRequest {
//
//    @NotBlank
//    private String name;
//
//    private String description;
//
//    @NotBlank
//    private String address;
//
//    @NotBlank
//    private String city;
//
//    @NotBlank
//    private String state;
//
//    @NotBlank
//    private String country;
//
//    private String zipCode;
//
//    private String phone;
//
//    @Email
//    private String email;
//
//    @Min(1)
//    @Max(5)
//    private Integer starRating;
//
//    private LocalTime checkInTime;
//
//    private LocalTime checkOutTime;
//}

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateHotelRequest {

    @NotBlank(message = "Hotel name is required")
    @Size(max = 150)
    private String name;

    private String description;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    @Size(max = 10)
    private String zipCode;

    @Size(max = 15)
    private String phone;

    @Email(message = "Invalid email address")
    private String email;

    @Min(value = 1, message = "Star rating must be at least 1")
    @Max(value = 5, message = "Star rating cannot exceed 5")
    private Integer starRating;

    private LocalTime checkInTime;

    private LocalTime checkOutTime;
}