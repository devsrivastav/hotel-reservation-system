package com.dev.hotel_backend.modules.dashboard.controller;

import com.dev.hotel_backend.modules.dashboard.dto.DashboardResponse;
import com.dev.hotel_backend.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardResponse getDashboard() {
        return dashboardService.getDashboard();
    }
}