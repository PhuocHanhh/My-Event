package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.DeviceRentalRequest;
import com.example.myevent_be.dto.request.DeviceRentalUpdateRequest;
import com.example.myevent_be.dto.response.DeviceRentalResponse;
import com.example.myevent_be.entity.DeviceRental;
import com.example.myevent_be.entity.Rental;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface DeviceRentalMapper {
    @Mapping(source = "device.id", target = "deviceID")
    @Mapping(source = "device.device_type.name", target = "deviceTypeName")
    @Mapping(source = "device.name", target = "deviceName")
    @Mapping(source = "device.user.first_name", target = "supplierName")
    @Mapping(source = "device.hourly_rental_fee", target = "pricePerDay")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(target = "totalPrice", expression = "java(deviceRental.getDevice().getHourly_rental_fee().multiply(new java.math.BigDecimal(deviceRental.getQuantity())))")
    @Mapping(source = "id", target = "id")
    @Mapping(source = "create_at", target = "create_at")
    @Mapping(source = "update_at", target = "update_at")
    @Mapping(source = "device.image", target = "image")
    @Mapping(source = "rental.id", target = "rental_id")
    DeviceRentalResponse toDeviceRentalResponse(DeviceRental deviceRental);

    @Mapping(source = "rentalId", target = "rental", qualifiedByName = "mapRentalById")
    DeviceRental toDeviceRental(DeviceRentalRequest request);

    @Named("mapRentalById")
    default Rental mapRentalById(String rentalid) {
        if (rentalid == null) return null;
        Rental rental = new Rental();
        rental.setId(rentalid);
        return rental;
    }

    @Mapping(target = "rental", ignore = true) // Bỏ qua mapping event_type vì đã xử lý trong service
    void updateDeviceRental(@MappingTarget DeviceRental deviceRental, DeviceRentalUpdateRequest request);
}