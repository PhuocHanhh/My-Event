package com.be_event.my_event_platform.services;


import com.example.myevent_be.dto.request.DeviceRequest;
import com.example.myevent_be.dto.response.DeviceResponse;
import com.example.myevent_be.dto.response.PageResponse;
import com.example.myevent_be.entity.Device;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.mapper.DeviceMapper;
import com.example.myevent_be.mapper.PageMapper;
import com.example.myevent_be.repository.DeviceRepository;
import com.example.myevent_be.repository.DeviceTypeRepository;
import com.example.myevent_be.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j

public class DeviceService {

    DeviceRepository deviceRepository;
    DeviceMapper deviceMapper;
    DeviceTypeRepository deviceTypeRepository;
    PageMapper pageMapper;
    UserRepository userRepository;

    @PreAuthorize("hasAuthority('SUPPLIER')")
    public DeviceResponse createDevice(DeviceRequest request) {

        Device device = deviceMapper.toDevice(request, deviceTypeRepository, userRepository);

        log.info("Received DeviceRequest: {}", request);
        log.info("deviceTypeId: {}", request.getDeviceType_id());

        deviceRepository.save(device);
        return deviceMapper.toResponse(device);
    }

    public PageResponse getDevices(int pageNo, int pageSize) {
        int p = 0;
        if (pageNo > 0) {
            p = pageNo - 1;
        }
        Page<Device> page = deviceRepository.findAll(PageRequest.of(p, pageSize));
        return pageMapper.toPageResponse(page, deviceMapper::toResponse);
    }

    public Device getDeviceById(String id) {
        return deviceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + id));
    }

    @PreAuthorize("hasAuthority('SUPPLIER')")
    public DeviceResponse updateDevice(DeviceRequest request, String id) {
        Device device = getDeviceById(id);
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            device.setImage(request.getImage());
        }

        deviceMapper.updateDevice(device, request);

        return deviceMapper.toResponse(deviceRepository.save(device));
    }

    public DeviceResponse getDevice(@PathVariable String id) {
        Device device = getDeviceById(id);
        return deviceMapper.toResponse(device);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public void deleteDevice(String id) {
        Device device = getDeviceById(id);
        deviceRepository.delete(device);
    }

}

