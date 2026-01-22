package com.be_event.my_event_platform.repositories;

import com.example.myevent_be.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, String> {
    boolean existsByPaymentIntentId(String paymentIntentId);
    Optional<Contract> findByPaymentIntentId(String paymentIntentId);
    List<Contract> findByCustomerId(String customerId);
    Optional<Contract> findById(String id);
    List<Contract> findByRentalIdIn(List<String> rentalIds);
}
