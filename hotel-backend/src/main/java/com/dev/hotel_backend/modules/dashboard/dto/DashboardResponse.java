package com.dev.hotel_backend.modules.dashboard.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class DashboardResponse {

    private Long totalUsers;

    private Long totalHotels;

    private Long totalRooms;

    private Long totalBookings;

    private Long confirmedBookings;

    private Long cancelledBookings;

    private BigDecimal totalRevenue;
}