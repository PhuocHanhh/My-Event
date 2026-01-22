package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.ContractRequest;
import com.example.myevent_be.dto.request.ContractUpdateRequest;
import com.example.myevent_be.dto.response.ContractResponse;
import com.example.myevent_be.entity.Contract;
import com.example.myevent_be.entity.Customer;
import com.example.myevent_be.entity.Rental;
import com.example.myevent_be.entity.User;
import com.example.myevent_be.enums.ContractStatus;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.mapper.ContractMapper;
import com.example.myevent_be.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContractService {
    private final ContractRepository contractRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final RentalRepository rentalRepository;
    private final ContractMapper contractMapper;

    @Transactional
    @PreAuthorize("hasAuthority('USER')")
//    public ContractResponse createContract(ContractRequest request) {
//        log.info("Creating contract with payment intent id: {}", request.getPaymentIntentId());
//
//        // Kiểm tra và lấy thông tin người dùng hiện tại
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        if (authentication == null || authentication.getAuthorities().isEmpty()) {
//            throw new IllegalStateException("Không tìm thấy thông tin xác thực hoặc vai trò người dùng");
//        }
//
//        // Tạo hoặc cập nhật customer
//        Customer customer = customerRepository.findByPhoneNumber(request.getCustomerPhone())
//                .orElseGet(Customer::new);
//        customer.setName(request.getCustomerName());
//        customer.setPhone_number(request.getCustomerPhone());
//        customer.setAddress(request.getAddress());
//        customerRepository.save(customer);
//
//        // Lấy rental từ rentalId nếu có
//        Rental rental = null;
//        if (request.getRentalId() != null) {
//            rental = rentalRepository.findById(request.getRentalId())
//                    .orElseThrow(() -> new AppException(ErrorCode.RENTAL_NOT_FOUND));
//        }
//
//        Contract contract = new Contract();
//        contract.setName(request.getName());
//        contract.setCustomer(customer);
//        contract.setPaymentIntentId(request.getPaymentIntentId());
//        if (request.getStatus() != null) {
//            contract.setStatus(ContractStatus.valueOf(request.getStatus()));
//        }
//        if (rental != null) {
//            contract.setRental(rental);
//        }
//        Contract savedContract = contractRepository.saveAndFlush(contract);
//        log.info("Created contract with id: {}", savedContract.getId());
//
//        // Trả về response bằng mapper để đảm bảo mapping đúng các trường ngày tháng
//        ContractResponse response = contractMapper.toContractResponse(savedContract);
//        response.setRentalId(request.getRentalId());
//        return response;
//    }
    public ContractResponse createContract(ContractRequest request) {
        log.info("Creating contract with payment intent id: {}", request.getPaymentIntentId());

        // Kiểm tra thông tin xác thực
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities().isEmpty()) {
            throw new IllegalStateException("Không tìm thấy thông tin xác thực hoặc vai trò người dùng");
        }

        // Tìm khách hàng theo số điện thoại
        List<Customer> customers = customerRepository.findByPhoneNumber(request.getCustomerPhone());
        Customer customer;

        // Kiểm tra và chọn hoặc tạo khách hàng
        if (customers.isEmpty()) {
            // Không tìm thấy -> tạo mới
            customer = new Customer();
            customer.setName(request.getCustomerName());
            customer.setPhoneNumber(request.getCustomerPhone());
            customer.setAddress(request.getAddress());
        } else {
            // Tìm khách hàng khớp với name và address
            customer = customers.stream()
                    .filter(c -> c.getName().equals(request.getCustomerName())
                            && c.getAddress().equals(request.getAddress()))
                    .findFirst()
                    .orElseGet(() -> {
                        // Không tìm thấy khách hàng khớp -> tạo mới
                        Customer newCustomer = new Customer();
                        newCustomer.setName(request.getCustomerName());
                        newCustomer.setPhoneNumber(request.getCustomerPhone());
                        newCustomer.setAddress(request.getAddress());
                        return newCustomer;
                    });
        }

        // Lưu khách hàng
        customer = customerRepository.save(customer);

        // Lấy rental từ rentalId nếu có
        Rental rental = null;
        if (request.getRentalId() != null) {
            rental = rentalRepository.findById(request.getRentalId())
                    .orElseThrow(() -> new AppException(ErrorCode.RENTAL_NOT_FOUND));
        }

        // Tạo hợp đồng mới
        Contract contract = new Contract();
        contract.setName(request.getName());
        contract.setCustomer(customer);
        contract.setPaymentIntentId(request.getPaymentIntentId());
        if (request.getStatus() != null) {
            contract.setStatus(ContractStatus.valueOf(request.getStatus()));
        }
        if (rental != null) {
            contract.setRental(rental);
        }

        // Lưu hợp đồng
        Contract savedContract = contractRepository.saveAndFlush(contract);
        log.info("Created contract with id: {}", savedContract.getId());

        // Trả về response
        ContractResponse response = contractMapper.toContractResponse(savedContract);
        response.setRentalId(request.getRentalId());
        return response;
    }

    //    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
//    public List<ContractResponse> getContracts() {
//        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().iterator().next().getAuthority();
//        if (role.equals("ADMIN") || role.equals("MANAGER")) {
//            return contractRepository.findAll().stream()
//                    .map(contractMapper::toContractResponse)
//                    .toList();
//        } else {
////            String email = SecurityContextHolder.getContext().getAuthentication().getName();
////            String customerId = userRepository.findByEmail(email).get().getId(); // Lấy customerId từ username
//            return contractRepository.findByCustomerId("d1451808-461c-4063-ad42-7d9025eb1478").stream()
//                    .map(contractMapper::toContractResponse)
//                    .toList();
////            return contractRepository.findByCustomerId(customerId).stream()
////                    .map(contractMapper::toContractResponse)
////                    .toList();
//
//        }
//    }
    public List<ContractResponse> getContracts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getAuthorities().isEmpty()) {
            throw new IllegalStateException("Người dùng chưa được xác thực hoặc không có vai trò");
        }

        String role = authentication.getAuthorities().iterator().next().getAuthority();
        if (Set.of("ADMIN", "MANAGER").contains(role)) {
            return contractRepository.findAll().stream()
                    .map(contractMapper::toContractResponse)
                    .toList();
        } else {
            String email = authentication.getName();
            if (email == null) {
                throw new IllegalStateException("Không tìm thấy email người dùng trong SecurityContext");
            }
            String userId = userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElseThrow(() -> new IllegalStateException("Không tìm thấy người dùng với email: " + email));

// Tìm danh sách Rental theo userId
            List<Rental> rentals = rentalRepository.findByUserId(userId);
            if (rentals.isEmpty()) {
                return Collections.emptyList(); // Trả về danh sách rỗng nếu không có rental nào
            }

// Lấy danh sách rentalId
            List<String> rentalIds = rentals.stream()
                    .map(Rental::getId)
                    .toList();

// Tìm tất cả Contract liên quan đến danh sách rentalId
            List<Contract> contracts = contractRepository.findByRentalIdIn(rentalIds);

// Chuyển đổi danh sách Contract thành ContractResponse
            return contracts.stream()
                    .map(contractMapper::toContractResponse)
                    .toList();
        }
    }

    public ContractResponse getContractById(String contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().iterator().next().getAuthority();
        if ((role.equals(""))) {

            String userId = SecurityContextHolder.getContext().getAuthentication().getName();
            if (!contract.getCustomer().getId().equals(userId)) {
                throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
            }
            log.info("id contract: " + contractId);
        }

        return contractMapper.toContractResponse(contract);
    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN')")
    public ContractResponse updateContract(String contractId, ContractUpdateRequest request) {
        log.info("Updating status for contract id: {} to status: {}", contractId, request.getStatus());
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

        log.info("Current contract status: {}", contract.getStatus());
        contractMapper.updateContract(contract, request);
        log.info("Updated contract status to: {}", contract.getStatus());

        Contract updatedContract = contractRepository.saveAndFlush(contract);
        log.info("Saved contract with status: {}", updatedContract.getStatus());

        // Refresh lại entity từ database để đảm bảo dữ liệu mới nhất
        Contract refreshedContract = contractRepository.findById(updatedContract.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        log.info("Refreshed contract status from database: {}", refreshedContract.getStatus());

        return contractMapper.toContractResponse(refreshedContract);
    }

    @Transactional
    public void deleteContract(String contractId) {
        if (!contractRepository.existsById(contractId)) {
            throw new AppException(ErrorCode.CONTRACT_NOT_FOUND);
        }
        contractRepository.deleteById(contractId);
    }

    public ContractResponse getContractByPaymentIntentId(String paymentIntentId) {
        return contractRepository.findByPaymentIntentId(paymentIntentId)
                .map(contractMapper::toContractResponse)
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
    }

}