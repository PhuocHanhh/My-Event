package com.be_event.my_event_platform.services;

import com.example.myevent_be.entity.Contract;
import com.example.myevent_be.entity.Customer;
import com.example.myevent_be.entity.Rental;
import com.example.myevent_be.entity.User;
import com.example.myevent_be.repository.ContractRepository;
import com.example.myevent_be.repository.CustomerRepository;
import com.example.myevent_be.repository.RentalRepository;
import com.example.myevent_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    private final ContractRepository contractRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    // Thống kê hợp đồng theo tháng
    public List<Integer> getContractStatisticsByMonth() {
        List<Contract> contracts = contractRepository.findAll();
        int[] monthlyData = new int[12];

        contracts.forEach(contract -> {
            Calendar cal = Calendar.getInstance();
            cal.setTime(contract.getCreate_at());
            int month = cal.get(Calendar.MONTH);
            monthlyData[month]++;
        });

        return Arrays.stream(monthlyData).boxed().toList();
    }

    // Thống kê người dùng theo tháng
    public List<Integer> getUserStatisticsByMonth(String currentUserRole) {
        List<User> users = userRepository.findAll();
        int[] monthlyData = new int[12];

        users.forEach(user -> {
            if (user.getRole() != null) {
                String userRole = user.getRole().getName();
                boolean shouldCount = false;

                if (currentUserRole.equals("ADMIN")) {
                    // Admin có thể xem MANAGER, USER và SUPPLIER
                    shouldCount = userRole.equals("MANAGER") ||
                            userRole.equals("USER") ||
                            userRole.equals("SUPPLIER");
                } else if (currentUserRole.equals("MANAGER")) {
                    // Manager chỉ có thể xem USER và SUPPLIER
                    shouldCount = userRole.equals("USER") ||
                            userRole.equals("SUPPLIER");
                }

                if (shouldCount) {
                    Calendar cal = Calendar.getInstance();
                    cal.setTime(user.getCreated_at());
                    int month = cal.get(Calendar.MONTH);
                    monthlyData[month]++;
                }
            }
        });

        return Arrays.stream(monthlyData).boxed().toList();
    }

    // Thống kê doanh thu theo tháng
    public List<BigDecimal> getRevenueStatisticsByMonth() {
        List<Rental> rentals = rentalRepository.findAll();
        BigDecimal[] monthlyData = new BigDecimal[12];
        Arrays.fill(monthlyData, BigDecimal.ZERO);

        rentals.forEach(rental -> {
            Calendar cal = Calendar.getInstance();
            cal.setTime(rental.getCreate_at());
            int month = cal.get(Calendar.MONTH);
            BigDecimal price = rental.getTotal_price() != null ? rental.getTotal_price() : BigDecimal.ZERO;
            monthlyData[month] = monthlyData[month].add(price);
        });

        return Arrays.asList(monthlyData);
    }

    // Thống kê doanh thu theo ngày
    public List<BigDecimal> getRevenueStatisticsByDay() {
        List<Rental> rentals = rentalRepository.findAll();
        BigDecimal[] dailyData = new BigDecimal[31]; // 31 ngày trong tháng
        Arrays.fill(dailyData, BigDecimal.ZERO);

        rentals.forEach(rental -> {
            Calendar cal = Calendar.getInstance();
            cal.setTime(rental.getCreate_at());
            int day = cal.get(Calendar.DAY_OF_MONTH) - 1; // -1 vì array index bắt đầu từ 0
            BigDecimal price = rental.getTotal_price() != null ? rental.getTotal_price() : BigDecimal.ZERO;
            dailyData[day] = dailyData[day].add(price);
        });

        return Arrays.asList(dailyData);
    }

    // Thống kê khách hàng theo năm
    public List<Integer> getCustomerStatisticsByYear() {
        List<Customer> customers = customerRepository.findAll();
        int[] yearlyData = new int[12]; // 12 tháng trong năm

        customers.forEach(customer -> {
            Calendar cal = Calendar.getInstance();
            cal.setTime(customer.getCreate_at());
            int month = cal.get(Calendar.MONTH);
            yearlyData[month]++;
        });

        return Arrays.stream(yearlyData).boxed().toList();
    }

    // Thống kê tổng quan cho dashboard
    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> result = new HashMap<>();

        // Doanh thu hôm nay
        Calendar today = Calendar.getInstance();
        BigDecimal revenueToday = rentalRepository.findAll().stream()
                .filter(rental -> {
                    Calendar cal = Calendar.getInstance();
                    cal.setTime(rental.getCreate_at());
                    return cal.get(Calendar.DAY_OF_MONTH) == today.get(Calendar.DAY_OF_MONTH) &&
                            cal.get(Calendar.MONTH) == today.get(Calendar.MONTH) &&
                            cal.get(Calendar.YEAR) == today.get(Calendar.YEAR);
                })
                .map(rental -> rental.getTotal_price() != null ? rental.getTotal_price() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tổng thu nhập tháng này
        BigDecimal revenueThisMonth = rentalRepository.findAll().stream()
                .filter(rental -> {
                    Calendar cal = Calendar.getInstance();
                    cal.setTime(rental.getCreate_at());
                    return cal.get(Calendar.MONTH) == today.get(Calendar.MONTH) &&
                            cal.get(Calendar.YEAR) == today.get(Calendar.YEAR);
                })
                .map(rental -> rental.getTotal_price() != null ? rental.getTotal_price() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Khách hàng trong năm
        long usersThisYear = userRepository.findAll().stream()
                .filter(user -> {
                    Calendar cal = Calendar.getInstance();
                    cal.setTime(user.getCreated_at());
                    return cal.get(Calendar.YEAR) == today.get(Calendar.YEAR);
                })
                .count();

        result.put("revenueToday", revenueToday);
        result.put("revenueThisMonth", revenueThisMonth);
        result.put("usersThisYear", usersThisYear);
        result.put("totalUsers", userRepository.count());
        result.put("totalContracts", contractRepository.count());
        result.put("totalRevenue", rentalRepository.findAll().stream()
                .map(rental -> rental.getTotal_price() != null ? rental.getTotal_price() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return result;
    }
}
