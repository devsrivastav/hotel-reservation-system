package com.dev.hotel_backend.modules.admin.service.impl;

import com.dev.hotel_backend.modules.admin.dto.AdminDashboardResponse;
import com.dev.hotel_backend.modules.admin.service.AdminService;
import com.dev.hotel_backend.modules.booking.enums.BookingStatus;
import com.dev.hotel_backend.modules.booking.repository.BookingRepository;
import com.dev.hotel_backend.modules.hotel.repository.HotelRepository;
import com.dev.hotel_backend.modules.room.repository.RoomRepository;
import com.dev.hotel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @Override
    public AdminDashboardResponse getDashboard() {

        long totalUsers = userRepository.count();

        long totalHotels = hotelRepository.count();

        long totalRooms = roomRepository.count();

        long totalBookings = bookingRepository.count();

        long confirmedBookings =
                bookingRepository.countByStatus(
                        BookingStatus.CONFIRMED
                );

        long cancelledBookings =
                bookingRepository.countByStatus(
                        BookingStatus.CANCELLED
                );

        BigDecimal totalRevenue =
                bookingRepository.getTotalRevenue();

        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalHotels(totalHotels)
                .totalRooms(totalRooms)
                .totalBookings(totalBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .totalRevenue(totalRevenue)
                .build();
    }
}