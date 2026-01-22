package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.PaymentResDTO;
import com.example.myevent_be.entity.Contract;
import com.example.myevent_be.enums.ContractStatus;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.repository.ContractRepository;
import com.example.myevent_be.repository.RentalRepository;
import com.example.myevent_be.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {
    private final VNPayService vnPayService;
    private final RentalRepository rentalRepository;
    private final ContractRepository contractRepository;

    @PostMapping("/vnpay")
    public ResponseEntity<PaymentResDTO> createPayment(@RequestParam String contractId,@RequestParam String paymentType, HttpServletRequest request) {
        try {
            // Lấy contract từ contractId
            Contract contract = contractRepository.findById(contractId)
                    .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));

            // Kiểm tra rental
            if (contract.getRental() == null) {
                return ResponseEntity.badRequest()
                        .body(new PaymentResDTO("ERROR", "Không tìm thấy thông tin đặt chỗ", null));
            }

            // Lấy totalPrice từ Rental
//            BigDecimal totalPrice = contract.getRental().getTotal_price();
//            if (totalPrice == null || totalPrice.compareTo(BigDecimal.ZERO) <= 0) {
//                return ResponseEntity.badRequest()
//                        .body(new PaymentResDTO("ERROR", "Số tiền thanh toán không hợp lệ", null));
//            }
            BigDecimal totalPrice = contract.getRental().getTotal_price();
            if (totalPrice == null || totalPrice.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest()
                        .body(new PaymentResDTO("ERROR", "Tổng số tiền không hợp lệ", null));
            }

            // Tính số tiền thanh toán dựa trên paymentType
            BigDecimal amountToPay;
//            if ("deposit".equalsIgnoreCase(paymentType)) {
//                // Đặt cọc: 10% totalPrice
//                amountToPay = totalPrice.multiply(new BigDecimal("0.1"));
//            } else if ("remaining".equalsIgnoreCase(paymentType)) {
//                // Thanh toán còn lại: 90% totalPrice
//                amountToPay = totalPrice.multiply(new BigDecimal("0.9"));
            if (("depos" +
                    "it").equalsIgnoreCase(paymentType)) {
                amountToPay = totalPrice.multiply(new BigDecimal("0.1"));
                log.info("Amount to Pay (Deposit 10%): {}", amountToPay);
            } else if ("remaining".equalsIgnoreCase(paymentType)) {
                amountToPay = totalPrice.multiply(new BigDecimal("0.9"));
                log.info("Amount to Pay (Remaining 90%): {}", amountToPay);
            } else {
                return ResponseEntity.badRequest()
                        .body(new PaymentResDTO("ERROR", "Loại thanh toán không hợp lệ. Chỉ hỗ trợ 'deposit' hoặc 'remaining'.", null));
            }
            if (amountToPay.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest()
                        .body(new PaymentResDTO("ERROR", "Số tiền thanh toán không hợp lệ", null));
            }

            // Tạo URL thanh toán VNPAY
            String paymentUrl = vnPayService.generateVNPayUrl(
                    amountToPay.doubleValue(),
                    contractId + paymentType,
                    VNPayService.getIpAddress(request)
            );

            return ResponseEntity.ok(new PaymentResDTO("OK", "Success", paymentUrl));
        } catch (Exception e) {
            log.error("Lỗi khi tạo thanh toán: ", e);
            return ResponseEntity.badRequest().body(new PaymentResDTO("ERROR", e.getMessage(), null));
        }
    }

    @GetMapping("/vnpay/return")
    public void paymentReturn(
            @RequestParam("vnp_ResponseCode") String responseCode,
            @RequestParam("vnp_TxnRef") String txnRef,
            @RequestParam("vnp_Amount") String amount,
            @RequestParam("vnp_OrderInfo") String orderInfo,
            @RequestParam("vnp_BankCode") String bankCode,
            @RequestParam("vnp_PayDate") String payDate,
            @RequestParam("vnp_TransactionNo") String transactionNo,
            @RequestParam("vnp_SecureHash") String secureHash,
            HttpServletResponse response
    ) throws IOException {
        try {
            log.info("Nhận kết quả thanh toán từ VNPAY - Mã giao dịch: {}", txnRef);
            log.info("Response Code: {}, Bank Code: {}, Amount: {}", responseCode, bankCode, amount);

            if ("00".equals(responseCode)) {
                log.info("Thanh toán thành công cho rental: {}", txnRef);
                String result = txnRef.replaceAll("(deposit|remaining)$", "");
                log.info("Minhhhhh: {}", result);
                // Cập nhật trạng thái contract
                Contract contract = contractRepository.findById(result)
                        .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
                log.info("Đã tìm thấy contract: {}", contract.getId());
                //_________________
                // Cập nhật trạng thái dựa vào trạng thái hiện tại
                if (contract.getStatus() == ContractStatus.Draft) {
                    contract.setStatus(ContractStatus.DepositPaid);
                } else if (contract.getStatus() == ContractStatus.WaitingPaid) {
                    contract.setStatus(ContractStatus.Completed);
                }
                contractRepository.save(contract);
                log.info("Đã cập nhật trạng thái contract thành {}", contract.getStatus());
                //__________________-

//                return ResponseEntity.ok("Thanh toán thành công!\n" +
//                        "Mã giao dịch: " + transactionNo + "\n" +
//                        "Ngân hàng: " + bankCode + "\n" +
//                        "Thời gian: " + payDate);
//                return ResponseEntity.ok(contract.getId());
                String redirectUrl = "http://127.0.0.1:5500/client/payment.html?id=" + contract.getId() + "&vnp_ResponseCode=" + responseCode +"&vnp_Amount="+amount + "&vnp_TransactionNo="+transactionNo +"&vnp_PayDate="+payDate;
                response.sendRedirect(redirectUrl);
            } else {
                log.warn("Thanh toán thất bại cho rental: {}, mã lỗi: {}", txnRef, responseCode);
//                return ResponseEntity.badRequest().body("Thanh toán thất bại! Mã lỗi: " + responseCode);
                response.sendRedirect("http://127.0.0.1:5500/client/ListContract.html");
            }
        } catch (AppException e) {
            log.error("Lỗi không tìm thấy contract: ", e);
//            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
            response.sendRedirect("http://127.0.0.1:5500/client/ListContract.html");
        } catch (Exception e) {
            log.error("Lỗi xử lý kết quả thanh toán: ", e);
//            return ResponseEntity.badRequest().body("Lỗi xử lý thanh toán: " + e.getMessage());
            response.sendRedirect("http://127.0.0.1:5500/client/ListContract.html");

        }
    }

    @PostMapping("/vnpay/ipn")
    public ResponseEntity<String> paymentIPN(
            @RequestParam("vnp_ResponseCode") String responseCode,
            @RequestParam("vnp_TxnRef") String txnRef,
            @RequestParam("vnp_Amount") String amount,
            @RequestParam("vnp_TransactionNo") String transactionNo,
            @RequestParam("vnp_SecureHash") String secureHash,
            HttpServletRequest request
    ) {
        try {
            log.info("Nhận IPN từ VNPAY - Mã giao dịch: {}", txnRef);

            // Tạo map chứa các tham số từ request
            Map<String, String> fields = new HashMap<>();
            for (String paramName : request.getParameterMap().keySet()) {
                String paramValue = request.getParameter(paramName);
                if (paramValue != null && paramValue.length() > 0) {
                    fields.put(paramName, paramValue);
                }
            }

            // Xóa các trường không cần thiết
            fields.remove("vnp_SecureHashType");
            fields.remove("vnp_SecureHash");

            // Kiểm tra checksum
            String signValue = vnPayService.hashAllFields(fields);
            if (!signValue.equals(secureHash)) {
                log.error("IPN: Invalid checksum");
                return ResponseEntity.ok("{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}");
            }

            // Kiểm tra contract tồn tại
            Contract contract = contractRepository.findById(txnRef)
                    .orElse(null);
            if (contract == null) {
                log.error("IPN: Contract not found - {}", txnRef);
                return ResponseEntity.ok("{\"RspCode\":\"01\",\"Message\":\"Order not Found\"}");
            }

            // Kiểm tra số tiền
            BigDecimal expectedAmount = contract.getRental().getTotal_price().multiply(new BigDecimal("100")); // VNPAY trả về số tiền * 100
            BigDecimal actualAmount = new BigDecimal(amount);
            if (!expectedAmount.equals(actualAmount)) {
                log.error("IPN: Invalid amount - Expected: {}, Actual: {}", expectedAmount, actualAmount);
                return ResponseEntity.ok("{\"RspCode\":\"04\",\"Message\":\"Invalid Amount\"}");
            }

            // Kiểm tra trạng thái contract
            if (contract.getStatus() == ContractStatus.Completed) {
                log.warn("IPN: Contract already completed - {}", txnRef);
                return ResponseEntity.ok("{\"RspCode\":\"02\",\"Message\":\"Order already confirmed\"}");
            }

            // Cập nhật trạng thái contract
            if ("00".equals(responseCode)) {
//                contract.setStatus(ContractStatus.Completed);
//                contractRepository.save(contract);
                if (contract.getStatus() == ContractStatus.Draft) {
                    contract.setStatus(ContractStatus.DepositPaid);
                } else if (contract.getStatus() == ContractStatus.WaitingPaid) {
                    contract.setStatus(ContractStatus.Completed);
                }
                contractRepository.save(contract);
                log.info("IPN: Payment successful - {}", txnRef);
                return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
            } else {
                contract.setStatus(ContractStatus.Cancel);
                contractRepository.save(contract);
                log.warn("IPN: Payment failed - {}", txnRef);
                return ResponseEntity.ok("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
            }

        } catch (Exception e) {
            log.error("IPN: Error processing payment - ", e);
            return ResponseEntity.ok("{\"RspCode\":\"99\",\"Message\":\"Unknown error\"}");
        }
    }
}
