package com.dev.hotel_backend.modules.booking.repository;

import com.dev.hotel_backend.modules.booking.entity.Booking;
import com.dev.hotel_backend.modules.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
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

    @Query("""
    SELECT COUNT(b) > 0
    FROM Booking b
    WHERE b.room.id = :roomId
    AND b.status <> 'CANCELLED'
    AND b.checkInDate < :checkOutDate
    AND b.checkOutDate > :checkInDate
    """)
    boolean existsConflictingBooking(
            @Param("roomId") Long roomId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );

    long countByStatus(BookingStatus status);

    @Query("""
SELECT COALESCE(SUM(b.totalPrice),0)
FROM Booking b
WHERE b.status = 'CONFIRMED'
""")
    BigDecimal getTotalRevenue();
}
