package com.dev.hotel_backend.modules.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalUsers;

    private long totalHotels;

    private long totalRooms;

    private long totalBookings;

    private long confirmedBookings;

    private long cancelledBookings;

    private BigDecimal totalRevenue;
}