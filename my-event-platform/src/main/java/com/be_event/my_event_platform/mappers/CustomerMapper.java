package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.CustomerRequest;
import com.example.myevent_be.dto.response.CustomerResponse;
import com.example.myevent_be.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring", uses = ContractMapper.class)
public interface CustomerMapper {
    //@Mapping(source = "id", target = "id")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "phoneNumber", target = "phoneNumber")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "create_at", target = "create_at")
    @Mapping(source = "update_at", target = "update_at")
    @Mapping(source = "contracts", target = "contracts")
    CustomerResponse toCustomerResponse(Customer customer);

    Customer toCustomer (CustomerRequest request);
}