package com.dev.hotel_backend.modules.booking.repository;

import com.dev.hotel_backend.modules.booking.entity.Booking;
import com.dev.hotel_backend.modules.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByRoomId(Long roomId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByRoomIdAndCheckOutDateAfterAndCheckInDateBefore(
            Long roomId,
            LocalDate checkInDate,
            LocalDate checkOutDate
    );

    boolean existsByRoomIdAndStatusNotAndCheckInDateLessThanAndCheckOutDateGreaterThan(
            Long roomId,
            BookingStatus status,
            LocalDate checkOutDate,
            LocalDate checkInDate
    );
}
