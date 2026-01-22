package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.ContractRequest;
import com.example.myevent_be.dto.request.ContractUpdateRequest;
import com.example.myevent_be.dto.response.ContractResponse;
import com.example.myevent_be.entity.Contract;
import com.example.myevent_be.enums.ContractStatus;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ContractMapper {
    @Mapping(source = "status", target = "status", qualifiedByName = "stringToStatus")
    Contract toContract(ContractRequest request);

    @Mapping(source = "create_at", target = "createdAt")
    @Mapping(source = "update_at", target = "updatedAt")
    @Mapping(source = "customer.name", target = "customerName")
    @Mapping(source = "customer.phoneNumber", target = "customerPhone")
    @Mapping(source = "customer.address", target = "address")
    @Mapping(source = "rental.id", target = "rentalId")
    @Mapping(source = "status", target = "status", qualifiedByName = "statusToString")
    @Mapping(source = "name", target = "name")
    ContractResponse toContractResponse(Contract contract);

    default void updateContract(@MappingTarget Contract contract, ContractUpdateRequest request) {
        if (request.getStatus() != null) {
            contract.setStatus(ContractStatus.valueOf(request.getStatus()));
        }
    }

    @Named("statusToString")
    default String statusToString(ContractStatus status) {
        return status != null ? status.name() : null;
    }

    @Named("stringToStatus")
    default ContractStatus stringToStatus(String status) {
        return status != null ? ContractStatus.valueOf(status) : null;
    }
}
