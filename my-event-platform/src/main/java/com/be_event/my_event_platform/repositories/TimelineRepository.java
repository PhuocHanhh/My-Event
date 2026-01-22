package com.be_event.my_event_platform.repositories;

import com.example.myevent_be.entity.TimeLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimelineRepository extends JpaRepository<TimeLine, String> {

    List<TimeLine> findByRentalId(String rentalId);
}