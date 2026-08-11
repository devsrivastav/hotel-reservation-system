package com.dev.hotel_backend.modules.dashboard.service.impl;

import com.dev.hotel_backend.modules.booking.enums.BookingStatus;
import com.dev.hotel_backend.modules.booking.repository.BookingRepository;
import com.dev.hotel_backend.modules.dashboard.dto.DashboardResponse;
import com.dev.hotel_backend.modules.dashboard.service.DashboardService;
import com.dev.hotel_backend.modules.hotel.repository.HotelRepository;
import com.dev.hotel_backend.modules.room.repository.RoomRepository;
import com.dev.hotel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @Override
    public DashboardResponse getDashboard() {

        BigDecimal revenue = bookingRepository.getTotalRevenue();

        return DashboardResponse.builder()
                .totalUsers(userRepository.count())
                .totalHotels(hotelRepository.count())
                .totalRooms(roomRepository.count())
                .totalBookings(bookingRepository.count())
                .confirmedBookings(
                        bookingRepository.countByStatus(
                                BookingStatus.CONFIRMED))
                .cancelledBookings(
                        bookingRepository.countByStatus(
                                BookingStatus.CANCELLED))
                .totalRevenue(revenue)
                .build();
    }
}