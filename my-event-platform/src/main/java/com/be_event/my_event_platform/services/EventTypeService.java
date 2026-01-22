package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.EventTypeCreateRequest;
import com.example.myevent_be.dto.request.EventTypeUpdateRequest;
import com.example.myevent_be.dto.response.EventTypeResponse;
import com.example.myevent_be.entity.EventType;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.mapper.EventTypeMapper;
import com.example.myevent_be.repository.EventTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor // thay the cho @Autowiret
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventTypeService {

    EventTypeRepository eventTypeRepository;
    EventTypeMapper eventTypeMapper;

    @PreAuthorize("hasAuthority('MANAGER')")
    public EventTypeResponse createEventType(EventTypeCreateRequest request){
        if (eventTypeRepository.existsByName(request.getName()))
            throw new AppException(ErrorCode.EVENTTYPE_EXISTED);

        EventType eventType = eventTypeMapper.toEventType(request);
        eventTypeRepository.save(eventType);
        return eventTypeMapper.toEventTypeResponse(eventType);
    }

    // @PreAuthorize("hasAuthority('MANAGER')")
    //@PreAuthorize("hasAnyAuthority('ADMIN', 'USER', 'SUPPLIER', 'MANAGER')")
    public List<EventTypeResponse> getEventTypes(){
        return eventTypeRepository.findAll().stream().map(eventTypeMapper::toEventTypeResponse).toList();
    }

    // @PreAuthorize("hasAuthority('MANAGER')")
    //@PreAuthorize("hasAnyAuthority('ADMIN', 'USER', 'SUPPLIER', 'MANAGER')")
    public EventTypeResponse getEventType(String id){
        return eventTypeMapper.toEventTypeResponse(
                eventTypeRepository.findById(id).orElseThrow(() -> new RuntimeException("EventType not found"))
        );
    }

    @PreAuthorize("hasAuthority('MANAGER')")
    public void deleteEventType(String id){
        eventTypeRepository.deleteById(id);
    }

    @PreAuthorize("hasAuthority('MANAGER')")
    public EventTypeResponse updateEventType(EventTypeUpdateRequest request, String id){
        EventType eventType = eventTypeRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Event type not found")
        );

        eventTypeMapper.updateEventType(eventType, request);

        return eventTypeMapper.toEventTypeResponse(eventTypeRepository.save(eventType));
    }
}
