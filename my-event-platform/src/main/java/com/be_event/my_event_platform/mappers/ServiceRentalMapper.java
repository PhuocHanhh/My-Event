package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.ServiceRentalRequest;
import com.example.myevent_be.dto.request.ServiceRentalUpdateRequest;
import com.example.myevent_be.dto.response.ServiceRentalResponse;
import com.example.myevent_be.entity.Rental;
import com.example.myevent_be.entity.Service;
import com.example.myevent_be.entity.ServiceRental;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.repository.ServiceRepository;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses =RentalMapper.class)
public interface ServiceRentalMapper {

    @Mapping(source = "service.id", target = "serviceID", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "service.name", target = "serviceName", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "service.user.first_name", target = "supplierName", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "service.hourly_salary", target = "pricePerDay", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(target = "totalPrice",
            expression = "java(serviceRental.getService() != null ? serviceRental.getService().getHourly_salary().multiply(new java.math.BigDecimal(serviceRental.getQuantity())) : java.math.BigDecimal.ZERO)")
    @Mapping(source = "id", target = "id")
    @Mapping(source = "create_at", target = "create_at")
    @Mapping(source = "update_at", target = "update_at")
    @Mapping(source = "service.image", target = "image")
    @Mapping(source = "rental.id", target = "rental_id")
    ServiceRentalResponse toSerivceRentalResponse(ServiceRental serviceRental);

    @Mapping(source = "rentalId", target = "rental", qualifiedByName = "mapRentalById")
    @Mapping(source = "serviceId", target = "service", qualifiedByName = "mapServiceById")
    ServiceRental toServiceRental(ServiceRentalRequest request, @Context ServiceRepository serviceRepository);

    @Named("mapRentalById")
    default Rental mapRentalById(String rentalId) {
        if (rentalId == null) return null;
        Rental rental = new Rental();
        rental.setId(rentalId);
        return rental;
    }

    @Named("mapServiceById")
    default Service mapServiceById(String serviceId, @Context ServiceRepository serviceRepository) {
        if (serviceId == null) return null;
        return serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + serviceId));
    }

    @Mapping(target = "rental", ignore = true) // Bỏ qua mapping event_type vì đã xử lý trong service
    void updateServiceRental(@MappingTarget ServiceRental deviceRental, ServiceRentalUpdateRequest request);
}