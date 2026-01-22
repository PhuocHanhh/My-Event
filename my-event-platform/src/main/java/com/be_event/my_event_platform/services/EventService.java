package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.EventCreateRequest;
import com.example.myevent_be.dto.request.EventUpdateRequest;
import com.example.myevent_be.dto.response.EventResponse;
import com.example.myevent_be.entity.Event;
import com.example.myevent_be.entity.EventType;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.mapper.EventMapper;
import com.example.myevent_be.repository.EventRepository;
import com.example.myevent_be.repository.EventTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
@RequiredArgsConstructor // thay the cho @Autowiret
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventService {
    EventMapper eventMapper;
    EventRepository eventRepository;
    EventTypeRepository eventTypeRepository;

    //@PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public EventResponse createEvent(EventCreateRequest request){
//        if (eventRepository.existsByName(request.getName()))
//            throw new AppException(ErrorCode.EVENTTYPE_EXISTED);

//        Event event = eventMapper.toEvent(request);

        // Lấy EventType từ DB
        EventType eventType = eventTypeRepository.findById(request.getEventType_id())
                .orElseThrow(() -> new AppException(ErrorCode.EVENT_TYPE_NOT_FOUND));

        // MapStruct không tự lấy eventType, phải set thủ công
        Event event = eventMapper.toEvent(request);

        log.info("Received EventCreateRequest: {}", request);
        log.info("eventTypeId: {}", request.getEventType_id());

        event.setEventType(eventType);
//        event.setEvent_type(eventType);
        eventRepository.save(event);
        return eventMapper.toEventResponse(event);
    }


    public List<EventResponse> getEvents(){ // xem danh sach su kien
        return eventRepository.findAll().stream().map(eventMapper::toEventResponse).toList();
    }

    public EventResponse getEvent(String id){ // xem chi tiet su kien
        return eventMapper.toEventResponse(
                eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"))
        );
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public void deleteEvent(@PathVariable String id){
        EventResponse event = getEvent(id);
        eventRepository.deleteById(id);
    }

    @PreAuthorize("hasAuthority('MANAGER')")
    public EventResponse updateEvent(EventUpdateRequest request, String id){
        Event event = eventRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Event not found")
        );

        // Lấy EventType từ DB nếu có event_type_id
        if (request.getEvent_type_id() != null) {
            EventType eventType = eventTypeRepository.findById(request.getEvent_type_id())
                    .orElseThrow(() -> new AppException(ErrorCode.EVENT_TYPE_NOT_FOUND));
//            event.setEvent_type(eventType);
            event.setEventType(eventType);
        }

        // Cập nhật trường img nếu có giá trị mới
        if (request.getImg() != null && !request.getImg().isEmpty()) {
            event.setImg(request.getImg());
        }

        eventMapper.updateEvent(event, request);

        return eventMapper.toEventResponse(eventRepository.save(event));

    }
}
