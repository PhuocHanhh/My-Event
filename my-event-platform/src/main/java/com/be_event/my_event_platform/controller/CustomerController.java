package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.request.CustomerRequest;
import com.example.myevent_be.dto.response.ApiResponse;
import com.example.myevent_be.dto.response.CustomerResponse;
import com.example.myevent_be.service.CustomerService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CustomerController {

    CustomerService customerService;

    @GetMapping
    public ApiResponse<List<CustomerResponse>> getAllCustomers() {
        log.info("Request get all customers");
        List<CustomerResponse> customers = customerService.getAllCustomers();
        return ApiResponse.<List<CustomerResponse>>builder()
                .result(customers)
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CustomerResponse> getCustomerById(@PathVariable String id) {
        log.info("Request get customer by id: {}", id);
        CustomerResponse customer = customerService.getCustomerById(id);
        return ApiResponse.<CustomerResponse>builder()
                .result(customer)
                .build();
    }

    @PostMapping
    public ApiResponse<CustomerResponse> createCustomer (@RequestBody @Valid CustomerRequest request){
        return ApiResponse.<CustomerResponse>builder()
                .result(customerService.createCustomer(request))
                .build();

    }
}