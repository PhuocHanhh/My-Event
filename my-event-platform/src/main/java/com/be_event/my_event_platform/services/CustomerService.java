package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.CustomerRequest;
import com.example.myevent_be.dto.response.CustomerResponse;
import com.example.myevent_be.entity.Customer;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.mapper.CustomerMapper;
import com.example.myevent_be.repository.CustomerRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CustomerService {

    CustomerRepository customerRepository;
    CustomerMapper customerMapper;

    public List<CustomerResponse> getAllCustomers() {
        log.info("Getting all customers");
        List<Customer> customers = customerRepository.findAll();
        return customers.stream()
                .map(customerMapper::toCustomerResponse)
                .toList();
    }

    public CustomerResponse getCustomerById(String id) {
        log.info("Getting customer by id: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return customerMapper.toCustomerResponse(customer);
    }

    public CustomerResponse createCustomer(CustomerRequest request){
        Customer customer = customerMapper.toCustomer(request);
        customer = customerRepository.save(customer);
        return customerMapper.toCustomerResponse(customer);
    }
}
