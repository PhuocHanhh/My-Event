package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.request.LocationRentalRequest;
import com.example.myevent_be.dto.response.ApiResponse;
import com.example.myevent_be.dto.response.LocationRentalResponse;
import com.example.myevent_be.entity.LocationRental;
import com.example.myevent_be.service.LocationRentalService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/location-rentals")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LocationRentalController {

    LocationRentalService locationRentalService;

    @PostMapping
    public ResponseEntity<LocationRental> createLocationRental(@Valid @RequestBody LocationRentalRequest request) {
        log.info("Request create location rental");
        LocationRental locationRental = locationRentalService.createLocationRental(request);
        return ResponseEntity.ok(locationRental);
    }

    @GetMapping
    public ResponseEntity<List<LocationRental>> getAllLocationRentals() {
        log.info("Request get all location rentals");
        List<LocationRental> locationRentals = locationRentalService.getAllLocationRentals();
        return ResponseEntity.ok(locationRentals);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationRental> getLocationRentalById(@PathVariable String id) {
        log.info("Request get location rental by id: {}", id);
        LocationRental locationRental = locationRentalService.getLocationRentalById(id);
        return ResponseEntity.ok(locationRental);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<LocationRental> updateLocationRental(
            @PathVariable String id,
            @Valid @RequestBody LocationRentalRequest request) {
        log.info("Request update location rental with id: {}", id);
        LocationRental locationRental = locationRentalService.updateLocationRental(id, request);
        return ResponseEntity.ok(locationRental);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocationRental(@PathVariable String id) {
        log.info("Request delete location rental with id: {}", id);
        locationRentalService.deleteLocationRental(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rental/{rentalId}")
    public ApiResponse<List<LocationRentalResponse>> getLocationRentalsByRentalId(@PathVariable String rentalId) {
        log.info("Request get location rentals by rental id: {}", rentalId);
        List<LocationRentalResponse> locationRentalResponses = locationRentalService.getLocationRentalsByRentalId(rentalId);
        return ApiResponse.<List<LocationRentalResponse>>builder()
                .result(locationRentalResponses)
                .build();
    }
} 