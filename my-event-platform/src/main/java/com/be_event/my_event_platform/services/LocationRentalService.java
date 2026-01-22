package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.LocationRentalRequest;
import com.example.myevent_be.dto.response.LocationRentalResponse;
import com.example.myevent_be.entity.Location;
import com.example.myevent_be.entity.LocationRental;
import com.example.myevent_be.entity.Rental;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.mapper.LocationRentalMapper;
import com.example.myevent_be.repository.LocationRentalRepository;
import com.example.myevent_be.repository.LocationRepository;
import com.example.myevent_be.repository.RentalRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LocationRentalService {

    LocationRentalRepository locationRentalRepository;
    LocationRepository locationRepository;
    RentalRepository rentalRepository;
    LocationRentalMapper locationRentalMapper;

    @Transactional
    public LocationRental createLocationRental(LocationRentalRequest request) {
        log.info("Creating new location rental");

        // Lấy hoặc tạo mới Location
        Location location = locationRepository.findAll().stream()
                .filter(l -> l.getId().equals(request.getLocationId()))
                .findFirst()
                .orElseGet(() -> {
                    Location newLocation = new Location();
                    return locationRepository.save(newLocation);
                });

        // Tạo mới LocationRental
        LocationRental locationRental = new LocationRental();
        locationRental.setLocation(location);
        locationRental.setQuantity(request.getQuantity());

        // Nếu có rentalId, liên kết với Rental
        if (request.getRentalId() != null) {
            Rental rental = rentalRepository.findById(request.getRentalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + request.getRentalId()));
            locationRental.setRental(rental);
        }

        // Lưu LocationRental
        return locationRentalRepository.save(locationRental);
    }

    public List<LocationRental> getAllLocationRentals() {
        log.info("Getting all location rentals");
        return locationRentalRepository.findAll();
    }

    public LocationRental getLocationRentalById(String id) {
        log.info("Getting location rental by id: {}", id);
        return locationRentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location rental not found with id: " + id));
    }

    @Transactional
    public LocationRental updateLocationRental(String id, LocationRentalRequest request) {
        log.info("Updating location rental with id: {}", id);
        
        LocationRental existingLocationRental = locationRentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location rental not found with id: " + id));
        
        // Lấy hoặc tạo mới Location
        Location location = locationRepository.findAll().stream()
                .filter(l -> l.getId().equals(request.getLocationId()))
                .findFirst()
                .orElseGet(() -> {
                    Location newLocation = new Location();
                    return locationRepository.save(newLocation);
                });

        // Cập nhật thông tin LocationRental
        existingLocationRental.setLocation(location);
        existingLocationRental.setQuantity(request.getQuantity());

        // Nếu có rentalId, liên kết với Rental
        if (request.getRentalId() != null) {
            Rental rental = rentalRepository.findById(request.getRentalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + request.getRentalId()));
            existingLocationRental.setRental(rental);
        }

        return locationRentalRepository.save(existingLocationRental);
    }

    @Transactional
    public void deleteLocationRental(String id) {
        log.info("Deleting location rental with id: {}", id);
        if (!locationRentalRepository.existsById(id)) {
            throw new ResourceNotFoundException("Location rental not found with id: " + id);
        }
        locationRentalRepository.deleteById(id);
    }

    public List<LocationRentalResponse> getLocationRentalsByRentalId(String rentalId) {
        log.info("Getting service rentals by rental id: {}", rentalId);

        // Check if rental exists
        if (!rentalRepository.existsById(rentalId)) {
            throw new ResourceNotFoundException("Rental not found with id: " + rentalId);
        }

        // Find all service rentals for the given rental ID
        List<LocationRental> locationRentals = locationRentalRepository.findByRentalId(rentalId);

        // Map to response DTOs
        return locationRentals.stream()
                .map(locationRentalMapper::toLocationRentalResponse)
                .toList();
    }
} 