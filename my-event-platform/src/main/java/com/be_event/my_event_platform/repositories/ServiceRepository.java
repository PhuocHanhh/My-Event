package com.be_event.my_event_platform.repositories;

import com.example.myevent_be.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<Service, String> {
}
