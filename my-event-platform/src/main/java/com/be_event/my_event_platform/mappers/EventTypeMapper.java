package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.EventTypeCreateRequest;
import com.example.myevent_be.dto.request.EventTypeUpdateRequest;
import com.example.myevent_be.dto.response.EventTypeResponse;
import com.example.myevent_be.entity.EventType;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface EventTypeMapper {
    EventType toEventType(EventTypeCreateRequest request);

//    @Mapping(target = "roles", source = "role.name")
    EventTypeResponse toEventTypeResponse(EventType eventType);
    void updateEventType(@MappingTarget EventType eventType, EventTypeUpdateRequest request);

    @Named("eventTypeToString")
    default String eventTypeToString(EventType eventType) {
        return eventType != null ? eventType.getName() : null;
    }

}
