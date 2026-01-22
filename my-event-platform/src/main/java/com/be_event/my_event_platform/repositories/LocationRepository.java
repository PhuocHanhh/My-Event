package com.be_event.my_event_platform.repositories;

import com.example.myevent_be.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location, String> {
    default String findNameById(String id) {
        return findById(id).map(Location::getName).orElse("");
    }

}
