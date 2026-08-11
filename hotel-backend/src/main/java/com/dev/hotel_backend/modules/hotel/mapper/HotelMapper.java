package com.dev.hotel_backend.modules.hotel.mapper;


import com.dev.hotel_backend.modules.hotel.dto.request.CreateHotelRequest;
import com.dev.hotel_backend.modules.hotel.dto.response.HotelResponse;
import com.dev.hotel_backend.modules.hotel.entity.Hotel;

public class HotelMapper {

    private HotelMapper() {}

    public static Hotel toEntity(CreateHotelRequest request) {

        return Hotel.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .zipCode(request.getZipCode())
                .phone(request.getPhone())
                .email(request.getEmail())
                .starRating(request.getStarRating())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .build();
    }

    public static HotelResponse toResponse(Hotel hotel) {

        return HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .description(hotel.getDescription())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .state(hotel.getState())
                .country(hotel.getCountry())
                .zipCode(hotel.getZipCode())
                .phone(hotel.getPhone())
                .email(hotel.getEmail())
                .starRating(hotel.getStarRating())
                .checkInTime(hotel.getCheckInTime())
                .checkOutTime(hotel.getCheckOutTime())
                .createdAt(hotel.getCreatedAt())
                .updatedAt(hotel.getUpdatedAt())
                .build();
    }

    public static HotelResponse toResponse(
            Hotel hotel,
            Double averageRating,
            Long totalReviews) {

        return HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .description(hotel.getDescription())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .state(hotel.getState())
                .country(hotel.getCountry())
                .zipCode(hotel.getZipCode())
                .phone(hotel.getPhone())
                .email(hotel.getEmail())
                .starRating(hotel.getStarRating())
                .checkInTime(hotel.getCheckInTime())
                .checkOutTime(hotel.getCheckOutTime())
                .createdAt(hotel.getCreatedAt())
                .updatedAt(hotel.getUpdatedAt())
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .build();
    }
}