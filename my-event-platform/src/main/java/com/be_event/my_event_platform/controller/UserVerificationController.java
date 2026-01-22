package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.response.ApiResponse;
import com.example.myevent_be.entity.UserVerificationRequest;
import com.example.myevent_be.repository.UserRepository;
import com.example.myevent_be.repository.UserVerificationRequestRepository;
import com.example.myevent_be.service.UserService;
import com.example.myevent_be.service.UserVerificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
public class UserVerificationController {
    private final UserVerificationService userVerificationService;
    private final UserVerificationRequestRepository verificationRequestRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(UserVerificationController.class);

    @GetMapping("/verify")
    public ResponseEntity<String> verifyUser(@RequestParam String code) {
        Optional<UserVerificationRequest> requestOpt =
                verificationRequestRepository.findByCode(code);

        if (requestOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Mã xác nhận không hợp lệ hoặc đã được sử dụng.");
        }

        UserVerificationRequest request = requestOpt.get();

        // Kiểm tra mã có hết hạn không
        if (request.getExpirationTime().before(new Date())) {
            return ResponseEntity.badRequest().body("Mã xác nhận đã hết hạn.");
        }

//        // Cập nhật trạng thái tài khoản
//        Optional<User> userOpt = userRepository.findByEmail(email);
//        if (userOpt.isPresent()) {
//            User user = userOpt.get();
////            user.setActive(true);
//            userRepository.save(user);
//        }

        // Đánh dấu mã đã sử dụng
//        request.setUsed(true);
        verificationRequestRepository.save(request);

        return ResponseEntity.ok("Tài khoản đã được xác nhận thành công.");
    }

    @PostMapping("/resend")
    public ResponseEntity<ApiResponse<String>> resendVerificationCode(@RequestParam String email) {
        try {
            userVerificationService.sendVerificationEmail(email);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                .code(HttpStatus.OK.value())
                .message("Mã xác nhận mới đã được gửi đến email của bạn")
                .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<String>builder()
                    .code(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Không thể gửi mã xác nhận. Vui lòng thử lại sau")
                    .build());
        }
    }
}
