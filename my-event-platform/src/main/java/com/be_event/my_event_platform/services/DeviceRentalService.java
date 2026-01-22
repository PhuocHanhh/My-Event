package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.DeviceRentalRequest;
import com.example.myevent_be.dto.request.DeviceRentalUpdateRequest;
import com.example.myevent_be.dto.response.DeviceRentalResponse;
import com.example.myevent_be.entity.Device;
import com.example.myevent_be.entity.DeviceRental;
import com.example.myevent_be.entity.Rental;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.mapper.DeviceRentalMapper;
import com.example.myevent_be.repository.DeviceRentalRepository;
import com.example.myevent_be.repository.DeviceRepository;
import com.example.myevent_be.repository.RentalRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DeviceRentalService {

    DeviceRentalRepository deviceRentalRepository;
    DeviceRentalMapper deviceRentalMapper;
    DeviceRepository deviceRepository;
    RentalRepository rentalRepository;

    public List<DeviceRentalResponse> getAllDeviceRentals() {
        log.info("Getting all device rentals");
        List<DeviceRental> deviceRentals = deviceRentalRepository.findAll();
        return deviceRentals.stream()
                .map(deviceRentalMapper::toDeviceRentalResponse)
                .toList();
    }

    public DeviceRentalResponse getDeviceRentalById(String id) {
        log.info("Getting device rental by id: {}", id);
        DeviceRental deviceRental = deviceRentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device rental not found with id: " + id));
        return deviceRentalMapper.toDeviceRentalResponse(deviceRental);
    }

    @Transactional
    public DeviceRentalResponse createDeviceRental(DeviceRentalRequest request) {
        log.info("Creating new device rental");

        Device device = deviceRepository.findById(request.getDeviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));

        // Kiểm tra số lượng còn lại
        if (device.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Số lượng thiết bị trong kho không đủ!");
        }

        // Trừ số lượng thiết bị
        device.setQuantity(device.getQuantity() - request.getQuantity());
        deviceRepository.save(device);

//        Rental rental = rentalRepository.findById(request.getRentalId())
//                .orElseThrow(() -> new ResourceNotFoundException("Rental not found"));

        DeviceRental deviceRental = new DeviceRental();
        deviceRental.setDevice(device);
//        deviceRental.setRental(rental);
        deviceRental.setQuantity(request.getQuantity());

        // Nếu có rentalId, liên kết với Rental
        if (request.getRentalId() != null) {
            Rental rental = rentalRepository.findById(request.getRentalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + request.getRentalId()));
            deviceRental.setRental(rental);
        }

        DeviceRental saved = deviceRentalRepository.save(deviceRental);
        return deviceRentalMapper.toDeviceRentalResponse(saved);
    }

    @Transactional
    public void deleteDeviceRental(String id) {
        log.info("Deleting device rental with id: {}", id);
        if (!deviceRentalRepository.existsById(id)) {
            throw new ResourceNotFoundException("Device rental not found with id: " + id);
        }
        deviceRentalRepository.deleteById(id);
    }

    @Transactional
    public DeviceRentalResponse updateDeviceRental(String id, DeviceRentalUpdateRequest request) {
        DeviceRental existingDeviceRental = deviceRentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device rental not found with id: " + id));

        DeviceRental updated = deviceRentalRepository.save(existingDeviceRental);
        deviceRentalMapper.updateDeviceRental(existingDeviceRental, request);
        return deviceRentalMapper.toDeviceRentalResponse(updated);
    }

    public List<DeviceRentalResponse> getDeviceRentalsByRentalId(String rentalId) {
        log.info("Getting device rentals by rental id: {}", rentalId);

        // Check if rental exists
        if (!rentalRepository.existsById(rentalId)) {
            throw new ResourceNotFoundException("Rental not found with id: " + rentalId);
        }

        // Find all device rentals for the given rental ID
        List<DeviceRental> deviceRentals = deviceRentalRepository.findByRentalId(rentalId);

        // Map to response DTOs
        return deviceRentals.stream()
                .map(deviceRentalMapper::toDeviceRentalResponse)
                .toList();
    }
}