package com.be_event.my_event_platform.repositories;

import com.example.myevent_be.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    List<Customer> findByPhoneNumber(String phoneNumber);

}