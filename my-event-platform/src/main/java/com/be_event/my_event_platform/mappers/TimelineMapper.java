package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.TimelineRequest;
import com.example.myevent_be.dto.request.TimelineUpdateRequest;
import com.example.myevent_be.dto.response.TimelineResponse;
import com.example.myevent_be.entity.Rental;
import com.example.myevent_be.entity.TimeLine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring", uses = RentalMapper.class)
public interface TimelineMapper {

    @Mapping(source = "rental_id", target = "rental", qualifiedByName = "mapRentalById")
    TimeLine toTimeline(TimelineRequest request);

    @Mapping(source = "rental.id", target = "rental_id")
    TimelineResponse toTimelineResponse(TimeLine timeline);

    @Mapping(target = "rental", ignore = true) // Bỏ qua mapping event_type vì đã xử lý trong service
    void updateTimeLine(@MappingTarget TimeLine timeLine, TimelineUpdateRequest request);

    @Named("mapRentalById")
    default Rental mapRentalById(String rentalid) {
        if (rentalid == null) return null;
        Rental rental = new Rental();
        rental.setId(rentalid);
        return rental;
    }
}
