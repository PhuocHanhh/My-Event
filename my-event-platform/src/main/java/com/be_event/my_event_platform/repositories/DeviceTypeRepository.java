package com.be_event.my_event_platform.repositories;

import com.example.myevent_be.entity.Device_Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeviceTypeRepository extends JpaRepository<Device_Type,String> {
    boolean existsByName(String name);
    Optional<Device_Type> findByName(String name);
}
