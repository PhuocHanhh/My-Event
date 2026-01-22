package com.be_event.my_event_platform.repositories;

import com.example.myevent_be.entity.Device;
import com.example.myevent_be.entity.Device_Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, String> {
//    Optional<Device> findByNameAndDevice_type(String name, Device_Type deviceType);

    @Query("SELECT d FROM Device d WHERE d.name = :name AND d.device_type = :deviceType")
    Optional<Device> findByNameAndDevice_type(@Param("name") String name, @Param("deviceType") Device_Type deviceType);
}
