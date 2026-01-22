package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.request.DeviceRentalRequest;
import com.example.myevent_be.dto.request.DeviceRentalUpdateRequest;
import com.example.myevent_be.dto.response.ApiResponse;
import com.example.myevent_be.dto.response.DeviceRentalResponse;
import com.example.myevent_be.service.DeviceRentalService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/device-rentals")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DeviceRentalController {

    DeviceRentalService deviceRentalService;

    @GetMapping
    public ApiResponse<List<DeviceRentalResponse>> getAllDeviceRentals() {
        log.info("Request get all device rentals");
        List<DeviceRentalResponse> deviceRentals = deviceRentalService.getAllDeviceRentals();
        return ApiResponse.<List<DeviceRentalResponse>>builder()
                .result(deviceRentals)
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<DeviceRentalResponse> getDeviceRentalById(@PathVariable String id) {
        log.info("Request get device rental by id: {}", id);
        DeviceRentalResponse deviceRental = deviceRentalService.getDeviceRentalById(id);
        return ApiResponse.<DeviceRentalResponse>builder()
                .result(deviceRental)
                .build();
    }

    @PostMapping
    public ApiResponse<DeviceRentalResponse> createDeviceRental(@Valid @RequestBody DeviceRentalRequest request) {
        log.info("Request create device rental {}",request.getDeviceId());
        DeviceRentalResponse deviceRental = deviceRentalService.createDeviceRental(request);
        return ApiResponse.<DeviceRentalResponse>builder()
                .result(deviceRental)
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteDeviceRental(@PathVariable String id) {
        deviceRentalService.deleteDeviceRental(id);
        return ApiResponse.<String>builder()
                .result("Deleted device rental with id: " + id)
                .build();
    }

    @PatchMapping("/{id}")
    public ApiResponse<DeviceRentalResponse> updateDeviceRental(
            @PathVariable String id,
            @Valid @RequestBody DeviceRentalUpdateRequest request) {
        log.info("Request update device rental with id: {}", id);
        DeviceRentalResponse deviceRental = deviceRentalService.updateDeviceRental(id, request);
        return ApiResponse.<DeviceRentalResponse>builder()
                .result(deviceRental)
                .build();
    }

    @GetMapping("/rental/{rentalId}")
    public ApiResponse<List<DeviceRentalResponse>> getDeviceRentalsByRentalId(@PathVariable String rentalId) {
        log.info("Request get device rentals by rental id: {}", rentalId);
        List<DeviceRentalResponse> deviceRentals = deviceRentalService.getDeviceRentalsByRentalId(rentalId);
        return ApiResponse.<List<DeviceRentalResponse>>builder()
                .result(deviceRentals)
                .build();
    }
}