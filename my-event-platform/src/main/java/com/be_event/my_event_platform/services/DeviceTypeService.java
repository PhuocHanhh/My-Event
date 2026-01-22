package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.DeviceTypeRequest;
import com.example.myevent_be.dto.response.DeviceTypeResponse;
import com.example.myevent_be.dto.response.PageResponse;
import com.example.myevent_be.entity.Device_Type;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.mapper.DeviceTypeMapper;
import com.example.myevent_be.mapper.PageMapper;
import com.example.myevent_be.repository.DeviceTypeRepository;
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
@RequiredArgsConstructor // thay the cho @Autowiret
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DeviceTypeService {
    DeviceTypeRepository deviceTypeRepository;
    DeviceTypeMapper deviceTypeMapper;
    PageMapper pageMapper;

    @PreAuthorize("hasAuthority('SUPPLIER')")
    public DeviceTypeResponse createDeviceType(DeviceTypeRequest request){
        if (deviceTypeRepository.existsByName(request.getName()))
            throw new AppException(ErrorCode.EVENTTYPE_EXISTED);

        Device_Type deviceType = deviceTypeMapper.toDeviceType(request);
        deviceTypeRepository.save(deviceType);
        return deviceTypeMapper.toDeviceTypeResponse(deviceType);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteDeviceType(String Id) {
        deviceTypeRepository.deleteById(Id);
        log.info("Device has deleted permanent successfully, Id={}", Id);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    public DeviceTypeResponse updateDeviceType(DeviceTypeRequest request, String id){
        Device_Type deviceType = getDeviceTypeById(id);

        deviceTypeMapper.updateDeviceType(deviceType,request);

        return deviceTypeMapper.toDeviceTypeResponse(deviceTypeRepository.save(deviceType));
    }



    public PageResponse getDeviceTypes(int pageNo, int pageSize) {
        int p=0;
        if(pageNo>0){
            p=pageNo-1;
        }
        Page<Device_Type> page = deviceTypeRepository.findAll(PageRequest.of(p, pageSize));
        return pageMapper.toPageResponse(page,deviceTypeMapper::toDeviceTypeResponse);
    }

    public DeviceTypeResponse getDeviceType(@PathVariable String id){
        Device_Type deviceType = getDeviceTypeById(id);
        return deviceTypeMapper.toDeviceTypeResponse(deviceType);
    }

    private Device_Type getDeviceTypeById(String Id) {
        return deviceTypeRepository.findById(Id).orElseThrow(() -> new ResourceNotFoundException("DeviceType not found"));
    }
}
