package com.dev.hotel_backend.modules.booking.mapper;


import com.dev.hotel_backend.modules.booking.dto.response.BookingResponse;
import com.dev.hotel_backend.modules.booking.entity.Booking;

public class BookingMapper {

    private BookingMapper() {
    }

    public static BookingResponse toResponse(Booking booking) {

        return BookingResponse.builder()
                .id(booking.getId())
                .roomId(booking.getRoom().getId())
                .roomNumber(booking.getRoom().getRoomNumber())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .customerName(booking.getUser() != null ? booking.getUser().getFirstName() + " " + booking.getUser().getLastName() : null)
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .numberOfGuests(booking.getNumberOfGuests())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .build();
    }
}