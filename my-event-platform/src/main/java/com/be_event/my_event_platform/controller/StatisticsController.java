package com.be_event.my_event_platform.controller;

import com.example.myevent_be.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    private final StatisticsService statisticsService;

    // API cho biểu đồ hợp đồng
    @GetMapping("/contracts/monthly")
    public ResponseEntity<List<Integer>> getContractStatistics() {
        return ResponseEntity.ok(statisticsService.getContractStatisticsByMonth());
    }

    // API cho biểu đồ người dùng
    @GetMapping("/users/monthly")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<List<Integer>> getUserStatistics() {
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(statisticsService.getUserStatisticsByMonth(role));
    }

    // API cho dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        return ResponseEntity.ok(statisticsService.getDashboardStatistics());
    }



    // API cho biểu đồ doanh thu
    @GetMapping("/revenue/monthly")
    public ResponseEntity<List<BigDecimal>> getRevenueStatistics() {
        return ResponseEntity.ok(statisticsService.getRevenueStatisticsByMonth());
    }

    // API cho biểu đồ doanh thu theo ngày
    @GetMapping("/revenue/daily")
    public ResponseEntity<List<BigDecimal>> getRevenueStatisticsByDay() {
        return ResponseEntity.ok(statisticsService.getRevenueStatisticsByDay());
    }
    // API cho biểu đồ khách hàng theo năm
    @GetMapping("/customers/yearly")
    public ResponseEntity<List<Integer>> getCustomerStatisticsByYear() {
        return ResponseEntity.ok(statisticsService.getCustomerStatisticsByYear());
    }
}
