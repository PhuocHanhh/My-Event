package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.RentalRequest;
import com.example.myevent_be.dto.request.RentalUpdateRequest;
import com.example.myevent_be.dto.response.RentalResponse;
import com.example.myevent_be.entity.Rental;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RentalMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "event.id", target = "eventId")
    @Mapping(source = "create_at", target = "createdAt")
    @Mapping(source = "update_at", target = "updatedAt")
    @Mapping(source = "total_price", target = "totalPrice")
    @Mapping(source = "rental_start_time", target = "rentalStartTime")
    @Mapping(source = "rental_end_time", target = "rentalEndTime")
    @Mapping(source = "custom_location", target = "customLocation")
    RentalResponse toRentalResponse(Rental rental);

    Rental toRental(RentalRequest request);



    void updateRental(@MappingTarget Rental rental, RentalUpdateRequest request);
} 