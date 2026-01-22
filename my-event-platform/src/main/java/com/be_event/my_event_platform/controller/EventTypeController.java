package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.request.EventTypeCreateRequest;
import com.example.myevent_be.dto.request.EventTypeUpdateRequest;
import com.example.myevent_be.dto.response.ApiResponse;
import com.example.myevent_be.dto.response.EventTypeResponse;
import com.example.myevent_be.service.EventTypeService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/event-type")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EventTypeController {
    EventTypeService eventTypeService;

    @PostMapping
    ApiResponse<EventTypeResponse> createEventType(@RequestBody @Valid EventTypeCreateRequest request){
        return ApiResponse.<EventTypeResponse>builder()
                .result(eventTypeService.createEventType(request))
                .build();
    }

    @GetMapping
    List<EventTypeResponse> getEventTypes(){
        return eventTypeService.getEventTypes();
    }

    @GetMapping("/{eventTypeId}")
    EventTypeResponse getEventType(@PathVariable("eventTypeId") String eventTypeId){
        return eventTypeService.getEventType(eventTypeId);
    }

    @DeleteMapping("/{eventTypeId}")
    String deleteEventType(@PathVariable String eventTypeId){
        eventTypeService.deleteEventType(eventTypeId);
        return "EventType has been deleted";
    }

    @PutMapping("/{eventTypeId}")
    EventTypeResponse updateEventType(@PathVariable String eventTypeId, @RequestBody EventTypeUpdateRequest request){
        return eventTypeService.updateEventType(request, eventTypeId);
    }
}
