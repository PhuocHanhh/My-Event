package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.DeviceTypeRequest;
import com.example.myevent_be.dto.response.DeviceTypeResponse;
import com.example.myevent_be.entity.Device_Type;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DeviceTypeMapper{
    Device_Type toDeviceType(DeviceTypeRequest request);
    DeviceTypeResponse toDeviceTypeResponse(Device_Type deviceType);
    void updateDeviceType(@MappingTarget Device_Type deviceType, DeviceTypeRequest request);
}
