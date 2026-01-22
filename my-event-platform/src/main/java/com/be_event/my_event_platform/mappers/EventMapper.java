package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.EventCreateRequest;
import com.example.myevent_be.dto.request.EventUpdateRequest;
import com.example.myevent_be.dto.response.EventResponse;
import com.example.myevent_be.entity.Event;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = EventTypeMapper.class)
public interface EventMapper {
    @Mapping(source = "eventType_id", target = "eventType.id")
    Event toEvent(EventCreateRequest request);

    @Mapping(source = "eventType.id", target = "eventTypeID")
    @Mapping(source = "eventType", target = "eventTypeName", qualifiedByName = "eventTypeToString")
    EventResponse toEventResponse(Event event);

    @Mapping(target = "eventType", ignore = true) // Bỏ qua mapping event_type vì đã xử lý trong service
    void updateEvent(@MappingTarget Event event, EventUpdateRequest request);
}
