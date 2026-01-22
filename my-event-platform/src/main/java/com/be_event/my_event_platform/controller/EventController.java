package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.request.EventCreateRequest;
import com.example.myevent_be.dto.request.EventUpdateRequest;
import com.example.myevent_be.dto.response.ApiResponse;
import com.example.myevent_be.dto.response.EventResponse;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.service.EventService;
import com.example.myevent_be.service.ImageStorageService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/event")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EventController {
    EventService eventService;
    ImageStorageService storageService;

    @PostMapping(value = "/create-event", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    ApiResponse<EventResponse> createEvent(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("event") @Valid EventCreateRequest request){
        log.info("Received create event request: {}", request);
//        log.info("File details - Name: {}, Size: {}, ContentType: {}",
//            file.getOriginalFilename(),
//            file.getSize(),
//            file.getContentType());

        try {
            // Store the uploaded file
            if (file != null && !file.isEmpty()) {
                String fileName = storageService.storeFile(file);
                request.setImg(fileName);
            } else {
                log.info("No file uploaded");
                request.setImg(null);
            }

            EventResponse response = eventService.createEvent(request);
            log.info("Event created successfully: {}", response);
            return ApiResponse.<EventResponse>builder()
                    .result(response)
                    .build();
        } catch (Exception e) {
            log.error("Error creating event: ", e);
            if (e instanceof AppException) {
                throw e;
            }
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @GetMapping
    List<EventResponse> getEvents(){
        return eventService.getEvents();
    } // xem danh sach su kien

    @GetMapping("/{eventId}")
    EventResponse getEvent(@PathVariable("eventId") String eventId){ // xem chi tiet su kien
        return eventService.getEvent(eventId);
    }

    @DeleteMapping("/{eventId}")
    String deleteEvent(@PathVariable String eventId){
        eventService.deleteEvent(eventId);
        return "Event has been deleted";
    }

//    @PatchMapping("/{eventId}")
//    EventResponse updateEvent(@PathVariable String eventId, @RequestBody EventUpdateRequest request){
//        return eventService.updateEvent(request, eventId);
//    }

    @PatchMapping(value = "/{eventId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<EventResponse> updateEvent(
            @PathVariable String eventId,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("event") @Valid EventUpdateRequest request) {
        log.info("Received update event request: {}", request);
        try {
            // Store the uploaded file
            String fileName = storageService.storeFile(file);
            log.info("File stored successfully with name: {}", fileName);

            // Set the image path in the request
            request.setImg(fileName);

            EventResponse response = eventService.updateEvent(request, eventId);
            log.info("Event created successfully: {}", response);
            return ApiResponse.<EventResponse>builder()
                    .result(response)
                    .build();
        } catch (Exception e) {
            log.error("Error creating event: ", e);
            if (e instanceof AppException) {
                throw e;
            }
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
}
