package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.request.*;
import com.example.myevent_be.dto.response.ApiResponse;
import com.example.myevent_be.dto.response.UserResponse;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.service.ImageStorageService;
import com.example.myevent_be.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;
    //    private final IStorageService storageService;
    ImageStorageService storageService;

    @PostMapping("/signing-up")
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreateRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<UserResponse> getUsers() {
        return userService.getUsers();
    }

    @GetMapping("/manager")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'USER')")
    public List<UserResponse> getUserByRole() {
        return userService.getUserByRole();
    }

    @GetMapping("/{userId}")
    public UserResponse getUser(@PathVariable("userId") String userId) {
        return userService.getUser(userId);
    }

    @PatchMapping(value = "/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<UserResponse> updateUser(
            @PathVariable String userId,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("user") @Valid UserUpdateRequest request) {
        log.info("Received update user request: {}", request);
        try {
            // Store the uploaded file
            String fileName = storageService.storeFile(file);
            log.info("File stored successfully with name: {}", fileName);

            // Set the image path in the request
            request.setAvatar(fileName);

            UserResponse response = userService.updateUser(userId, request);
            log.info("Event created successfully: {}", response);
            return ApiResponse.<UserResponse>builder()
                    .result(response)
                    .build();
        } catch (Exception e) {
            log.error("Error creating event: ", e);
//            if (e instanceof AppException) {
//                throw e;
//            }
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
//    @PatchMapping(value = "/{userId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE,
//            MediaType.APPLICATION_JSON_VALUE})
//    @ResponseBody
//    public ResponseEntity<UserResponse> updateUser(
//            @PathVariable String id,
//            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
//            @RequestParam(value = "data", required = false) String data)
//            throws IOException {
//        UserResponse response = userService.updateUser(id, avatar, data);
//        return ResponseEntity.ok(response);
//    }

    @DeleteMapping("/{userId}")
    public String deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return "User has been deleted";
    }

    @PutMapping("/update-role/{userId}")
    public UserResponse updateUserRole(@PathVariable String userId, @RequestBody UpdateUserRoleRequest request) {
        return userService.updateUserRole(userId, request.getRole());
    }

    @PutMapping("/update-password/{userId}")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @PathVariable("userId") String userId,
            @RequestBody ResetPasswordRequest2 request,
            @AuthenticationPrincipal Jwt jwt) {
        System.out.println("Received request with userId: " + userId);
        System.out.println("Old password: " + request.getOldPassword());
        System.out.println("New password: " + request.getNewPassword());
        System.out.println("Confirm password: " + request.getConfirmPassword());

        userService.resetPassword(userId, request);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .result("Password updated successfully")
                .build());
    }
}
