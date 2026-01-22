package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.TimelineRequest;
import com.example.myevent_be.dto.request.TimelineUpdateRequest;
import com.example.myevent_be.dto.response.PageResponse;
import com.example.myevent_be.dto.response.TimelineResponse;
import com.example.myevent_be.entity.Rental;
import com.example.myevent_be.entity.TimeLine;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.mapper.PageMapper;
import com.example.myevent_be.mapper.TimelineMapper;
import com.example.myevent_be.repository.RentalRepository;
import com.example.myevent_be.repository.TimelineRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TimelineService {

    TimelineRepository timelineRepository;
    TimelineMapper timelineMapper;
    PageMapper pageMapper;
     RentalRepository rentalRepository;


    public TimelineResponse createTimeline(TimelineRequest request) {
        log.info("Creating new timeline rental");
        TimeLine timeline = timelineMapper.toTimeline(request);

        log.info("Received TimelineRequest: {}", request);
        // Nếu có rentalId, liên kết với Rental
        if (request.getRental_id() != null) {
            Rental rental = rentalRepository.findById(request.getRental_id())
                    .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + request.getRental_id()));
            timeline.setRental(rental);
        }

        timelineRepository.save(timeline);
        return timelineMapper.toTimelineResponse(timeline);
    }

    public PageResponse getTimelines(int pageNo, int pageSize) {
        int p=0;
        if(pageNo>0){
            p=pageNo-1;
        }
        Page<TimeLine> page = timelineRepository.findAll(PageRequest.of(p, pageSize));
        return pageMapper.toPageResponse(page,timelineMapper::toTimelineResponse);
    }

    public TimeLine getTimelineById(String id) {
        return timelineRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Timeline not found with rentalid: " + id));
    }


    @Transactional
    public TimelineResponse updatrTimeLine(String id, TimelineUpdateRequest request) {
        TimeLine timeLine = timelineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("time line not found with id: " + id));

        TimeLine updated = timelineRepository.save(timeLine);
        timelineMapper.updateTimeLine(timeLine, request);
        return timelineMapper.toTimelineResponse(updated);
    }

    public TimelineResponse getTimeline(@PathVariable String id){
        TimeLine timeline= getTimelineById(id);
        return timelineMapper.toTimelineResponse(timeline);
    }

    public void deleteTimeline(String id) {
        TimeLine timeline= getTimelineById(id);
       timelineRepository.delete(timeline);
    }

    public List<TimelineResponse> getTimelinesByRentalId(String rentalId) {
        log.info("Getting timelines by rental id: {}", rentalId);

        // Find all timelines for the given rental ID
        List<TimeLine> timelines = timelineRepository.findByRentalId(rentalId);

        // Map to response DTOs
        return timelines.stream()
                .map(timelineMapper::toTimelineResponse)
                .toList();
    }
}