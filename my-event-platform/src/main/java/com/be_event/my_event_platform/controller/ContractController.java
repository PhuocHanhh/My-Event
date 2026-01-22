package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.request.ContractRequest;
import com.example.myevent_be.dto.request.ContractUpdateRequest;
import com.example.myevent_be.dto.response.ApiResponse;
import com.example.myevent_be.dto.response.ContractResponse;
import com.example.myevent_be.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {
    private final ContractService contractService;

    @PostMapping
    //@PreAuthorize("hasAuthority('USER')")
    public ApiResponse<ContractResponse> createContract(@RequestBody @Valid ContractRequest contractRequest) {
        ContractResponse contractResponse = contractService.createContract(contractRequest);
        return ApiResponse.<ContractResponse>builder()
                .result(contractResponse)
                .build();
    }

    @GetMapping
    //@PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ApiResponse<List<ContractResponse>> getContracts() {
        List<ContractResponse> contracts = contractService.getContracts();
        return ApiResponse.<List<ContractResponse>>builder()
                .result(contracts)
                .build();
    }

    @GetMapping("/{contractId}")
//    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ApiResponse<ContractResponse> getContractById(@PathVariable String contractId) {
        ContractResponse contractResponse = contractService.getContractById(contractId);
        return ApiResponse.<ContractResponse>builder()
                .result(contractResponse)
                .build();
    }

    @PutMapping("/{contractId}")
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<ContractResponse> updateContract(@PathVariable String contractId, @RequestBody @Valid ContractUpdateRequest contractUpdateRequest) {
        ContractResponse contractResponse = contractService.updateContract(contractId, contractUpdateRequest);
        return ApiResponse.<ContractResponse>builder()
                .result(contractResponse)
                .build();
    }

    @DeleteMapping("/{contractId}")
    //@PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<Void> deleteContract(@PathVariable String contractId) {
        contractService.deleteContract(contractId);
        return ApiResponse.<Void>builder()
                .result(null)
                .build();
    }
}
