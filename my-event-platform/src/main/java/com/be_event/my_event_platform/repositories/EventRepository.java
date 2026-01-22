package com.be_event.my_event_platform.repositories;

import com.example.myevent_be.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, String> {
    boolean existsByName(String name);
    Optional<Event> findByName(String event);
    List<Event> findByEventType_Name(String eventTypeName);

}

