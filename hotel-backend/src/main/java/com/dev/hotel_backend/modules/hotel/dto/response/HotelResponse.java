package com.dev.hotel_backend.modules.hotel.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelResponse {

    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String phone;
    private String email;
    private Integer starRating;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}