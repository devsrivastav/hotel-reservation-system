package com.dev.hotel_backend.modules.hotel.mapper;

import com.dev.hotel_backend.modules.hotel.dto.request.CreateHotelRequest;
import com.dev.hotel_backend.modules.hotel.dto.request.UpdateHotelRequest;
import com.dev.hotel_backend.modules.hotel.dto.response.HotelResponse;
import com.dev.hotel_backend.modules.hotel.entity.Hotel;

public final class HotelMapper {

    private HotelMapper() {
        // Utility class
    }

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
                .imageUrl(hotel.getImageUrl())
                .active(hotel.getActive())
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
            Long totalReviews
    ) {

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

    public static void updateEntity(
            Hotel hotel,
            UpdateHotelRequest request
    ) {

        if (request.getName() != null) {
            hotel.setName(request.getName());
        }

        if (request.getDescription() != null) {
            hotel.setDescription(request.getDescription());
        }

        if (request.getAddress() != null) {
            hotel.setAddress(request.getAddress());
        }

        if (request.getCity() != null) {
            hotel.setCity(request.getCity());
        }

        if (request.getState() != null) {
            hotel.setState(request.getState());
        }

        if (request.getCountry() != null) {
            hotel.setCountry(request.getCountry());
        }

        if (request.getZipCode() != null) {
            hotel.setZipCode(request.getZipCode());
        }

        if (request.getPhone() != null) {
            hotel.setPhone(request.getPhone());
        }

        if (request.getEmail() != null) {
            hotel.setEmail(request.getEmail());
        }

        if (request.getStarRating() != null) {
            hotel.setStarRating(request.getStarRating());
        }

        if (request.getCheckInTime() != null) {
            hotel.setCheckInTime(request.getCheckInTime());
        }

        if (request.getCheckOutTime() != null) {
            hotel.setCheckOutTime(request.getCheckOutTime());
        }
    }
}