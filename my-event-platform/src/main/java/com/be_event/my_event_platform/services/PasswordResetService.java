package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.ForgetPasswordRequest;
import com.example.myevent_be.dto.request.ResetPasswordRequest;
import com.example.myevent_be.dto.response.UserResponse;
import com.example.myevent_be.entity.PasswordResetToken;
import com.example.myevent_be.entity.User;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.mapper.UserMapper;
import com.example.myevent_be.repository.PasswordResetTokenRepository;
import com.example.myevent_be.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PasswordResetService {
    UserRepository userRepository;
    PasswordResetTokenRepository passwordResetTokenRepository;
    JavaMailSender mailSender;
    UserMapper userMapper;

    private final Map<String, PasswordResetToken> verificationCodes = new ConcurrentHashMap<>();

    @Transactional
    public UserResponse sendResetPasswordToken(ForgetPasswordRequest request)
            throws MessagingException {
        log.info("Starting password reset process for email: {}", request.getEmail());
        try {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));
            log.info("Found user with email: {}", user.getEmail());

            passwordResetTokenRepository.deleteByUser(user);
            log.info("Deleted any existing tokens for user");

            String verificationCode = String.format("%06d", new Random().nextInt(999999));

            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(verificationCode);
            resetToken.setUser(user);

            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.MINUTE, 15);
            resetToken.setExpiryDate(calendar.getTime());

            passwordResetTokenRepository.save(resetToken);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(user.getEmail());
            helper.setSubject("Mã xác nhận đặt lại mật khẩu");
            helper.setText(
                    "<p>Chào " + user.getFirst_name() + " " + user.getLast_name() + ",</p>" +
                            "<p>Mã xác nhận đặt lại mật khẩu của bạn là: <b>" + verificationCode + "</b></p>" +
                            "<p>Mã này có hiệu lực trong 15 phút.</p>" +
                            "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>",
                    true
            );

            mailSender.send(message);
            log.info("Verification code email sent to: {}", user.getEmail());

            return userMapper.toUserResponse(user);

        } catch (Exception e) {
            log.error("Error during password reset process: ", e);
            throw e;
        }
    }

    
    public boolean verifyCode(String email, String inputCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));

        Optional<PasswordResetToken> optionalToken =
                passwordResetTokenRepository.findByUserIdAndToken(user.getId(),inputCode);
        if (optionalToken.isEmpty()) {
            return false;
        }
        PasswordResetToken token = optionalToken.get();

        if (token.getExpiryDate() == null || token.getExpiryDate().before(new Date())) {
            passwordResetTokenRepository.delete(token);
            return false;
        }

        return true;
    }

    @Transactional
    public UserResponse resetPassword(String token, ResetPasswordRequest request) {
        log.info("Starting password reset with token: {}", token);
        try {
            PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

            if (resetToken.getExpiryDate().before(new Date())) {
                passwordResetTokenRepository.delete(resetToken);
                throw new AppException(ErrorCode.TOKEN_EXPIRED);
            }

            User user = resetToken.getUser();
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            log.info("Updated password for user: {}", user.getEmail());

            passwordResetTokenRepository.delete(resetToken);

            return userMapper.toUserResponse(user);
        } catch (Exception e) {
            log.error("Error during password reset: ", e);
            throw e;
        }
    }


    @Transactional
    public void resetPasswordByCode(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.EMAIL_NOT_FOUND));
        PasswordResetToken token = passwordResetTokenRepository
                .findByUserIdAndToken(user.getId(), request.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        if (token.getExpiryDate().before(new Date())) {
            passwordResetTokenRepository.delete(token);
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        user.setPassword(new BCryptPasswordEncoder().encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(token);
    }
}
