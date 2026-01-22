package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.RentalRequest;
import com.example.myevent_be.dto.request.RentalUpdateRequest;
import com.example.myevent_be.dto.response.RentalResponse;
import com.example.myevent_be.entity.Event;
import com.example.myevent_be.entity.Rental;
import com.example.myevent_be.entity.User;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.mapper.RentalMapper;
import com.example.myevent_be.repository.EventRepository;
import com.example.myevent_be.repository.RentalRepository;
import com.example.myevent_be.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RentalService {
    private static final Logger log = LoggerFactory.getLogger(RentalService.class);
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RentalMapper rentalMapper;

    public List<RentalResponse> getAllRentals() {
        return rentalRepository.findAll().stream()
                .map(rentalMapper::toRentalResponse)
                .toList();
    }

    public Optional<RentalResponse> getRentalById(String id) {
        return rentalRepository.findById(id).map(rentalMapper::toRentalResponse);
    }

    public RentalResponse createRental(RentalRequest request) {
        log.info("RentalRequest received: {}", request);

        Rental rental = new Rental();
        rental.setTotal_price(request.getTotalPrice());
        rental.setRental_start_time(request.getRentalStartTime());
        rental.setRental_end_time(request.getRentalEndTime());
        rental.setCustom_location(request.getCustomLocation());

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId()).orElse(null);
            if (user == null) {
                log.warn("User with id {} not found!", request.getUserId());
            }
            rental.setUser(user);
        } else {
            log.warn("UserId is null in request!");
        }

        if (request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId()).orElse(null);
            if (event == null) {
                log.warn("Event with id {} not found!", request.getEventId());
            }
            rental.setEvent(event);
        } else {
            log.warn("EventId is null in request!");
        }

        log.info("Rental entity before save: {}", rental);

        Rental saved = rentalRepository.save(rental);
        return rentalMapper.toRentalResponse(saved);
    }

//    public Optional<RentalResponse> updateRental(String id, RentalRequest request) {
//        return rentalRepository.findById(id).map(rental -> {
//            rental.setTotal_price(request.getTotalPrice());
//            rental.setRental_start_time(request.getRentalStartTime());
//            rental.setRental_end_time(request.getRentalEndTime());
//            rental.setCustom_location(request.getCustomLocation());
//            if (request.getUserId() != null) {
//                User user = userRepository.findById(request.getUserId()).orElse(null);
//                rental.setUser(user);
//            }
//            if (request.getEventId() != null) {
////                Event event = eventRepository.findById(request.getEventId()).orElse(null);
//                Rental saved = rentalRepository.save(rental);
//                log.info("Updated rental: {}", saved);
//                return rentalMapper.toRentalResponse(saved);
////                rental.setEvent(saved);
//            }
//            return rentalMapper.toRentalResponse(rentalRepository.save(rental));
//        });
//    }

    @Transactional
    public RentalResponse updateRental(String id, RentalUpdateRequest request) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(" rental not found with id: " + id));

        Rental updated = rentalRepository.save(rental);
        rentalMapper.updateRental(rental, request);
        return rentalMapper.toRentalResponse(updated);
    }

    public boolean deleteRental(String id) {
        if (!rentalRepository.existsById(id)) {
            return false;
        }
        rentalRepository.deleteById(id);
        return true;
    }

    public List<RentalResponse> getRentalsByEventId(String eventId) {
        return rentalRepository.findByEventId(eventId).stream()
                .map(rentalMapper::toRentalResponse)
                .toList();
    }

}
