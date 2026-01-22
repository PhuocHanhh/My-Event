package com.be_event.my_event_platform.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {
    AuthenticationService authenticationService;
    PasswordResetService passwordResetService;
    UserVerificationService userVerificationService;
    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> authenticated(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgetPasswordRequest request)
            throws MessagingException {
        passwordResetService.sendResetPasswordToken(request);
        return ApiResponse.<Void>builder()
                .message("Mã xác thực đã được gửi đến email của bạn")
                .build();
    }

    @PostMapping("/verify-pass-code")
    public ResponseEntity<ApiResponse<String>> verifyCode(@RequestBody ForgetPasswordRequest1 request) {
        boolean isValid = passwordResetService.verifyCode(request.getEmail(),request.getCode());
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .result("Xác minh thành công")
                    .message("Bạn có thể đặt lại mật khẩu")
                    .build());
        }

        return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                .message("Mã xác minh không hợp lệ hoặc đã hết hạn")
                .build());
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPasswordByCode(request);
        return ApiResponse.<Void>builder()
                .message("Đổi mật khẩu thành công")
                .build();
    }

    @GetMapping("/verify-code")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> verifyEmail(@RequestParam String code) {
        if (userVerificationService.verifyCode(code)) {
            return ResponseEntity.ok(ApiResponse.<AuthenticationResponse>builder()
                    .message("Xác thực thành công")
                    .build());
        }
        return ResponseEntity.badRequest()
                .body(ApiResponse.<AuthenticationResponse>builder()
                        .code(HttpStatus.BAD_REQUEST.value())
                        .message("Mã xác thực không hợp lệ hoặc đã hết hạn")
                        .build());
    }
}
