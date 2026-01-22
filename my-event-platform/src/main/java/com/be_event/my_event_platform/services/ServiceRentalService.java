package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.ServiceRentalRequest;
import com.example.myevent_be.dto.request.ServiceRentalUpdateRequest;
import com.example.myevent_be.dto.response.ServiceRentalResponse;
import com.example.myevent_be.entity.Rental;
import com.example.myevent_be.entity.Service;
import com.example.myevent_be.entity.ServiceRental;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.mapper.ServiceRentalMapper;
import com.example.myevent_be.repository.RentalRepository;
import com.example.myevent_be.repository.ServiceRentalRepository;
import com.example.myevent_be.repository.ServiceRepository;
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
public class ServiceRentalService {

    ServiceRentalRepository serviceRentalRepository;
    ServiceRepository serviceRepository;
    RentalRepository rentalRepository;
    ServiceRentalMapper serviceRentalMapper;

    @Transactional
    public ServiceRentalResponse createServiceRental(ServiceRentalRequest request) {
        log.info("Creating new service rental");

        // Kiểm tra serviceId
        if (request.getServiceId() == null) {
            throw new IllegalArgumentException("Service ID cannot be null");
        }

        // Tìm Service
        Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + request.getServiceId()));

        // Tạo mới ServiceRental
        ServiceRental serviceRental = new ServiceRental();
        serviceRental.setQuantity(request.getQuantity());
        serviceRental.setService(service); // Gán Service

        // Nếu có rentalId, liên kết với Rental
        if (request.getRentalId() != null) {
            Rental rental = rentalRepository.findById(request.getRentalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + request.getRentalId()));
            serviceRental.setRental(rental);
        }

        // Lưu ServiceRental
        ServiceRental saved = serviceRentalRepository.save(serviceRental);
        return serviceRentalMapper.toSerivceRentalResponse(saved);
    }

    public List<ServiceRentalResponse> getAllServiceRentals() {
        log.info("Getting all device rentals");
        List<ServiceRental> deviceRentals = serviceRentalRepository.findAll();
        return deviceRentals.stream()
                .map(serviceRentalMapper::toSerivceRentalResponse)
                .toList();
    }

    public ServiceRentalResponse getServiceRentalById(String id) {
        log.info("Getting device rental by id: {}", id);
        ServiceRental deviceRental = serviceRentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device rental not found with id: " + id));
        return serviceRentalMapper.toSerivceRentalResponse(deviceRental);
    }

    @Transactional
    public ServiceRentalResponse updateServiceRental(String id, ServiceRentalUpdateRequest request) {
        ServiceRental existingServiceRental = serviceRentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device rental not found with id: " + id));

        ServiceRental updated = serviceRentalRepository.save(existingServiceRental);
        serviceRentalMapper.updateServiceRental(existingServiceRental, request);
        return serviceRentalMapper.toSerivceRentalResponse(updated);
    }

    @Transactional
    public void deleteServiceRental(String id) {
        log.info("Deleting service rental with id: {}", id);
        if (!serviceRentalRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service rental not found with id: " + id);
        }
        serviceRentalRepository.deleteById(id);
    }

    public List<ServiceRentalResponse> getServiceRentalsByRentalId(String rentalId) {
        log.info("Getting service rentals by rental id: {}", rentalId);

        // Check if rental exists
        if (!rentalRepository.existsById(rentalId)) {
            throw new ResourceNotFoundException("Rental not found with id: " + rentalId);
        }

        // Find all service rentals for the given rental ID
        List<ServiceRental> serviceRentals = serviceRentalRepository.findByRentalId(rentalId);

        // Map to response DTOs
        return serviceRentals.stream()
                .map(serviceRentalMapper::toSerivceRentalResponse)
                .toList();
    }
} 