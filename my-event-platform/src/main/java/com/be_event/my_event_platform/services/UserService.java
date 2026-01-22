package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.ResetPasswordRequest2;
import com.example.myevent_be.dto.request.UserCreateRequest;
import com.example.myevent_be.dto.request.UserUpdateRequest;
import com.example.myevent_be.dto.response.UserResponse;
import com.example.myevent_be.entity.Role;
import com.example.myevent_be.entity.User;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.mapper.UserMapper;
import com.example.myevent_be.repository.PasswordResetTokenRepository;
import com.example.myevent_be.repository.RoleRepository;
import com.example.myevent_be.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserVerificationService userVerificationService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    
    @Value("${file.upload-dir:${user.home}/uploads}")
    private String uploadDir;

    // Constructor for final fields
    public UserService(UserRepository userRepository, 
                      UserMapper userMapper, 
                      RoleRepository roleRepository, 
                      PasswordEncoder passwordEncoder, 
                      UserVerificationService userVerificationService, 
                      PasswordResetTokenRepository passwordResetTokenRepository) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.userVerificationService = userVerificationService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Transactional
    public UserResponse createUser(UserCreateRequest request) {
        // Kiểm tra độ dài mật khẩu
        if (request == null || request.getPassword().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có ít nhất 8 ký tự.");
        }
        if (userRepository.existsByEmail(request.getEmail()))
            throw new AppException(ErrorCode.USER_EXISTED);

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Kiểm tra xem role "USER" đã tồn tại chưa
        Role role = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("USER");
                    return roleRepository.save(newRole);
                });

        user.setRole(role);

        // Lưu user trước
        user = userRepository.save(user);

        // Gửi email xác nhận sau khi lưu user
        userVerificationService.sendVerificationEmail(user.getEmail());

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

//    @PreAuthorize("hasAuthority('MANAGER', 'USER')")
    public List<UserResponse> getUserByRole() {
        List<Role> roles = roleRepository.findByNameIn(Arrays.asList("USER", "SUPPLIER"));
        return userRepository.findByRoleIn(roles)
                .stream().map(userMapper::toUserResponse).toList();
    }

    public UserResponse getUser(String id) {
        log.info("Fetching user with ID:  {}", id);
        return userMapper.toUserResponse(userRepository
                .findById(id).orElseThrow(() -> new RuntimeException("User not found")));
    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER', 'SUPPLIER', 'MANAGER')")
    public UserResponse updateUser(String id, UserUpdateRequest request)
            throws IOException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng."
                ));

//        // Parse JSON data từ FormData
//        ObjectMapper objectMapper = new ObjectMapper();
//        UserUpdateRequest request = null;
//        if (data != null && !data.isEmpty()) {
//            request = objectMapper.readValue(data, UserUpdateRequest.class);
//            // Cập nhật các trường từ request
//            userMapper.updateUser(user, request);
//            // Cập nhật password nếu có
//            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
//                user.setPassword(passwordEncoder.encode(request.getPassword()));
//            }
//        }
//
//        // Xử lý file ảnh nếu có
//        if (avatar != null && !avatar.isEmpty()) {
//            String fileName = UUID.randomUUID() + "_" + avatar.getOriginalFilename();
//            Path filePath = Paths.get(uploadDir, fileName);
//            Files.createDirectories(filePath.getParent());
//            avatar.transferTo(filePath);
////            // Lưu đường dẫn đầy đủ
////            String avatarUrl = "/api/v1/FileUpload/files/" + fileName;
////            user.setAvatar(avatarUrl);
//        }
        // Cập nhật trường img nếu có giá trị mới
        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            user.setAvatar(request.getAvatar());
        }

        // Lưu user và trả về response
        User updatedUser = userRepository.save(user);
        return userMapper.toUserResponse(updatedUser);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER', 'SUPPLIER', 'MANAGER')")
    public UserResponse resetPassword(String id, ResetPasswordRequest2 request2) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy người dùng."
                ));

        // Kiểm tra dữ liệu đầu vào
        if (request2.getOldPassword() == null || request2.getNewPassword() == null ||
                request2.getConfirmPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu không được để trống");
        }

        // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
        if (!request2.getNewPassword().equals(request2.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới và xác nhận mật khẩu không khớp");
        }

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(request2.getOldPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu cũ không đúng");
        }

        // Mã hóa mật khẩu mới
        String encodedNewPassword = passwordEncoder.encode(request2.getNewPassword());
        user.setPassword(encodedNewPassword);

        // Lưu người dùng
        userRepository.save(user);

        // Kiểm tra lại sau khi lưu
        User updatedUser = userRepository.findById(id).orElse(null);
        if (updatedUser == null || !updatedUser.getPassword().equals(encodedNewPassword)) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi cập nhật mật khẩu");
        }
        System.out.println("Password after save: " + updatedUser.getPassword());
        return userMapper.toUserResponse(userRepository.save(user));

    }

    @Transactional
    @PreAuthorize("hasAnyAuthority('MANAGER', 'USER')")
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete associated password reset tokens first
        passwordResetTokenRepository.deleteByUser(user);

        // Now delete the user
        userRepository.delete(user);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public UserResponse updateUserRole(String userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));

        user.setRole(role);

        return userMapper.toUserResponse(userRepository.save(user));
    }

}
