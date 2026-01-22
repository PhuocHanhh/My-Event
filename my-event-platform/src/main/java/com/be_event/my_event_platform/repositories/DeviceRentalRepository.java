package com.be_event.my_event_platform.repositories;

import com.example.myevent_be.entity.DeviceRental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceRentalRepository extends JpaRepository<DeviceRental, String> {
    List<DeviceRental> findByRentalId(String rentalId);
}