package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.LocationRentalUpdateRequest;
import com.example.myevent_be.dto.response.LocationRentalResponse;
import com.example.myevent_be.entity.*;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.repository.LocationRepository;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses =RentalMapper.class)
public interface LocationRentalMapper {

    @Mapping(source = "location.id", target = "locationID", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "location.name", target = "name", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "location.user.first_name", target = "supplierName", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "location.hourly_rental_fee", target = "hourly_rental_fee", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "id", target = "id")
    @Mapping(source = "create_at", target = "created_at")
    @Mapping(source = "update_at", target = "update_at")
    @Mapping(source = "location.image", target = "image")
    @Mapping(source = "rental.id", target = "rental_id")
    @Mapping(source = "location.address", target = "address")
    @Mapping(source = "location.description", target = "description")
    LocationRentalResponse toLocationRentalResponse(LocationRental serviceRental);

//    @Mapping(source = "rentalId", target = "rental", qualifiedByName = "mapRentalById")
//    @Mapping(source = "locationId", target = "location", qualifiedByName = "mapServiceById")
//    LocationRental toLocationRental(LocationRentalRequest request, @Context LocationRentalRepository locationRentalRepository);

    @Named("mapRentalById")
    default Rental mapRentalById(String rentalId) {
        if (rentalId == null) return null;
        Rental rental = new Rental();
        rental.setId(rentalId);
        return rental;
    }

    @Named("mapServiceById")
    default Location mapLocationById(String locationId, @Context LocationRepository locationRepository) {
        if (locationId == null) return null;
        return locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("location not found with id: " + locationId));
    }

    @Mapping(target = "rental", ignore = true) // Bỏ qua mapping event_type vì đã xử lý trong service
    void updateLocationRental(@MappingTarget LocationRental locationRental, LocationRentalUpdateRequest request);
}