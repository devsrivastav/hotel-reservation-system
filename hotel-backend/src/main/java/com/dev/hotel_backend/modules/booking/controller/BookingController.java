
package com.dev.hotel_backend.modules.booking.controller;

import com.dev.hotel_backend.modules.booking.dto.request.CreateBookingRequest;
import com.dev.hotel_backend.modules.booking.dto.response.BookingResponse;
import com.dev.hotel_backend.modules.booking.enums.BookingStatus;
import com.dev.hotel_backend.modules.booking.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // =====================================================
    // CUSTOMER - CREATE BOOKING
    // =====================================================

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public BookingResponse createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Authentication authentication
    ) {
        return bookingService.createBooking(
                request,
                authentication.getName()
        );
    }

    // =====================================================
    // CUSTOMER - MY BOOKINGS
    // =====================================================

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/my")
    public List<BookingResponse> getMyBookings(
            Authentication authentication
    ) {
        return bookingService.getMyBookings(
                authentication.getName()
        );
    }

    // =====================================================
    // CUSTOMER - GET BOOKING BY ID
    // =====================================================

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/{id}")
    public BookingResponse getBookingById(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        return bookingService.getBookingById(
                id,
                authentication.getName()
        );
    }

    // =====================================================
    // CUSTOMER - CANCEL OWN BOOKING
    // =====================================================

    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping("/{id}/cancel")
    public String cancelBooking(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        bookingService.cancelBooking(
                id,
                authentication.getName()
        );

        return "Booking cancelled successfully.";
    }

    // =====================================================
    // ADMIN - GET ALL BOOKINGS
    // =====================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @GetMapping("/admin/all")
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // =====================================================
    // ADMIN - GET BOOKINGS BY STATUS
    // =====================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @GetMapping("/admin/status/{status}")
    public List<BookingResponse> getBookingsByStatus(
            @PathVariable("status") BookingStatus status
    ) {
        return bookingService.getBookingsByStatus(status);
    }

    // =====================================================
    // ADMIN - CANCEL BOOKING
    // =====================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/admin/{id}/cancel")
    public String cancelBookingByAdmin(
            @PathVariable("id") Long id
    ) {
        bookingService.cancelBookingByAdmin(id);

        return "Booking cancelled successfully.";
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/admin/{id}/confirm")
    public String confirmBookingByAdmin(
            @PathVariable("id") Long id
    ) {
        bookingService.confirmBookingByAdmin(id);

        return "Booking confirmed successfully.";
    }
}
