package com.dev.hotel_backend.modules.booking.service;

import com.dev.hotel_backend.modules.booking.dto.request.CreateBookingRequest;
import com.dev.hotel_backend.modules.booking.dto.response.BookingResponse;
import com.dev.hotel_backend.modules.booking.enums.BookingStatus;

import java.util.List;

public interface BookingService {

    // Customer
    BookingResponse createBooking(
            CreateBookingRequest request,
            String userEmail
    );

    List<BookingResponse> getMyBookings(
            String userEmail
    );

    BookingResponse getBookingById(
            Long bookingId,
            String userEmail
    );

    void cancelBooking(
            Long bookingId,
            String userEmail
    );

    // Admin
    List<BookingResponse> getAllBookings();

    List<BookingResponse> getBookingsByStatus(
            BookingStatus status
    );
    void cancelBookingByAdmin(Long bookingId);
    void confirmBookingByAdmin(Long bookingId);

}