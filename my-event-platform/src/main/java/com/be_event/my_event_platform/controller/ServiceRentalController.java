package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.request.ServiceRentalRequest;
import com.example.myevent_be.dto.request.ServiceRentalUpdateRequest;
import com.example.myevent_be.dto.response.ApiResponse;
import com.example.myevent_be.dto.response.ServiceRentalResponse;
import com.example.myevent_be.service.ServiceRentalService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-rentals")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ServiceRentalController {

    ServiceRentalService serviceRentalService;

    @PostMapping
    public ApiResponse<ServiceRentalResponse> createServiceRental(@Valid @RequestBody ServiceRentalRequest request) {
        log.info("Request create service rental");
        if (request.getServiceId() == null) {
            throw new IllegalArgumentException("Service ID cannot be null");
        }
        ServiceRentalResponse serviceRental = serviceRentalService.createServiceRental(request);
        return ApiResponse.<ServiceRentalResponse>builder()
                .result(serviceRental)
                .build();
    }

    @GetMapping
    public ApiResponse<List<ServiceRentalResponse>> getAllDeviceRentals() {
        log.info("Request get all device rentals");
        List<ServiceRentalResponse> serviceRentals = serviceRentalService.getAllServiceRentals();
        return ApiResponse.<List<ServiceRentalResponse>>builder()
                .result(serviceRentals)
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ServiceRentalResponse> getDeviceRentalById(@PathVariable String id) {
        log.info("Request get device rental by id: {}", id);
        ServiceRentalResponse deviceRental = serviceRentalService.getServiceRentalById(id);
        return ApiResponse.<ServiceRentalResponse>builder()
                .result(deviceRental)
                .build();
    }

    @PatchMapping("/{id}")
    public ApiResponse<ServiceRentalResponse> updateRental(
            @PathVariable String id,
            @Valid @RequestBody ServiceRentalUpdateRequest request) {
        log.info("Request update device rental with id: {}", id);
        ServiceRentalResponse serviceRental = serviceRentalService.updateServiceRental(id, request);
        return ApiResponse.<ServiceRentalResponse>builder()
                .result(serviceRental)
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceRental(@PathVariable String id) {
        log.info("Request delete service rental with id: {}", id);
        serviceRentalService.deleteServiceRental(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rental/{id}")
    public ApiResponse<List<ServiceRentalResponse>> getServiceRentalById(@PathVariable String id) {
        log.info("Getting service rental by id: {}", id);
        List<ServiceRentalResponse> serviceRentals = serviceRentalService.getServiceRentalsByRentalId(id);
        return ApiResponse.<List<ServiceRentalResponse>>builder()
                .result(serviceRentals)
                .build();
    }
} 