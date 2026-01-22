package com.be_event.my_event_platform.services;

import com.example.myevent_be.entity.UserVerificationRequest;
import com.example.myevent_be.enums.VerificationType;
import com.example.myevent_be.repository.UserVerificationRequestRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Calendar;
import java.util.Date;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class UserVerificationService {
    private final UserVerificationRequestRepository verificationRequestRepository;
    private final JavaMailSender mailSender;
    private static final Logger logger = LoggerFactory.getLogger(UserVerificationService.class);

    @Transactional
    public void sendVerificationEmail(String email) {
        try {
            // Xóa token cũ nếu có
            verificationRequestRepository.deleteByEmail(email);

            // Tạo token mới
            UserVerificationRequest verificationRequest = UserVerificationRequest.builder()
                .email(email)
                .code(generateVerificationCode())
                .type(VerificationType.EMAIL_VERIFICATION.toString())
                .expirationTime(generateExpirationTime())
                .build();

            // Lưu token mới
            verificationRequestRepository.saveAndFlush(verificationRequest);

            // Gửi email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("Xác nhận tài khoản của bạn");
            helper.setText("<p>Chào bạn,</p>" +
                    "<p>Mã xác nhận của bạn là: <b>" + verificationRequest.getCode() + "</b></p>" +
                    "<p>Mã này có hiệu lực trong 15 phút.</p>" +
                    "<p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>", true);

            mailSender.send(message);
            logger.info("Verification email sent successfully to: {}", email);
        } catch (MessagingException e) {
            logger.error("Error sending verification email to: {}", email, e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Không thể gửi email xác nhận. Vui lòng thử lại sau."
            );
        } catch (Exception e) {
            logger.error("Unexpected error while sending verification email to: {}", email, e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Đã xảy ra lỗi không mong muốn"
            );
        }
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // mã 6 số
        return String.valueOf(code);
    }

    private Date generateExpirationTime() {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, 15); // mã có hiệu lực trong 15 phút
        return calendar.getTime();
    }

    public boolean verifyCode(String code) {
        Optional<UserVerificationRequest> requestOpt =
                verificationRequestRepository.findByCode(code);

        if (requestOpt.isEmpty()) {
            logger.warn("No verification request found for code: {} ",code);
            return false;
        }

        UserVerificationRequest request = requestOpt.get();
        
        // Kiểm tra code có hết hạn chưa
        if (request.getExpirationTime().before(new Date())) {
            verificationRequestRepository.delete(request);
            return false;
        }

        // Xóa code sau khi xác thực thành công
        verificationRequestRepository.delete(request);
        return true;
    }
}
