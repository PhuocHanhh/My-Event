package com.be_event.my_event_platform.services;

import com.example.myevent_be.dto.request.AuthenticationRequest;
import com.example.myevent_be.dto.request.IntrospectRequest;
import com.example.myevent_be.dto.request.LogoutRequest;
import com.example.myevent_be.dto.response.AuthenticationResponse;
import com.example.myevent_be.dto.response.IntrospectResponse;
import com.example.myevent_be.entity.Role;
import com.example.myevent_be.entity.Token;
import com.example.myevent_be.entity.User;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.mapper.UserMapper;
import com.example.myevent_be.repository.PasswordResetTokenRepository;
import com.example.myevent_be.repository.TokenRepository;
import com.example.myevent_be.repository.UserRepository;
import com.example.myevent_be.repository.UserVerificationRequestRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    UserRepository userRepository;
    TokenRepository tokenRepository;
    UserMapper userMapper;
    UserVerificationRequestRepository verificationRequestRepository;
    PasswordResetTokenRepository passwordResetTokenRepository;


    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SINGER_KEY;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    public AuthenticationResponse authenticate(AuthenticationRequest request){
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

//        System.out.println("User found: " + user); // 🛠 Debug dữ liệu

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        boolean authenticated =passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!authenticated){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        var token = generateToken(user);

        return AuthenticationResponse.builder()
                .token(token).authenticated(true)
                .user(userMapper.toUserResponse(user)) // 🆕 Trả về user trực tiếp để kiểm tra
                .build();
    }


    // login
    public String generateToken(User user){
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .claim("userId", user.getId()) // Thêm userId vào claim
                .issuer("khanhhuyen")
                .issueTime(new Date())
                .expirationTime(new Date(Instant.now()
                        .plus(1, ChronoUnit.HOURS)
                        .toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("userId", user.getId())  // Thêm ID vào claim
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);
        try {
            jwsObject.sign(new MACSigner(SINGER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Can not create token", e);
            throw new RuntimeException(e);
        }
    }

    @SneakyThrows
    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        JWSVerifier jwsVerifier = new MACVerifier(SINGER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date exprityTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(jwsVerifier);

        return IntrospectResponse.builder()
                .valid(verified && exprityTime.after(new Date()))
                .build();
    }

    private String buildScope(User user){
        StringJoiner stringJoiner = new StringJoiner(" ");
        Role role = user.getRole();
//        Set<Role> role = user.getRole();
//        for (Role roles : role) {
//            stringJoiner.add(roles.getName()); // Ví dụ: Lấy tên role
//        }

        if (role != null) {
            stringJoiner.add(role.getName());
        }

        return stringJoiner.toString();
    }

    @Transactional
    public void someMethod(String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        Hibernate.initialize(user.getRole()); // Khởi tạo collection trước khi dùng
        System.out.println(user.getRole()); // Giờ có thể sử dụng mà không lỗi
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws ParseException, JOSEException {
        JWSVerifier verifier = new MACVerifier(SINGER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        signedJWT.verify(verifier);

        // kiem tra token da het han chua
        Date expiryTime = (isRefresh)
                ? new Date(signedJWT
                .getJWTClaimsSet()
                .getIssueTime()
                .toInstant()
                .plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS)
                .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!verified && expiryTime.after(new Date())) throw new AppException(ErrorCode.UNAUTHORIZED);

        if (tokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    // log out
    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();
            String email = signToken.getJWTClaimsSet().getSubject();

            // Kiểm tra token có tồn tại trước khi cập nhật
            Token token = tokenRepository.findById(jit)
                    .orElseGet(() -> Token.builder()
                            .id(jit)
                            .email(email)
                            .access_token(request.getToken())
                            .build());

            token.setLast_date(expiryTime);
            tokenRepository.save(token);
            log.info("Saved logout token for user: {}", email);
        } catch (AppException e) {
            log.info("Token already expired");
        }
        catch (ParseException | JOSEException e) {
            log.error("Lỗi khi phân tích token: {}", e.getMessage());
        }
        catch (Exception e) {
            log.error("Lỗi không mong muốn khi logout: {}", e.getMessage());
        }
    }

//    public boolean verifyResetCode(String code) {
//        return passwordResetTokenRepository
//                .findByCode(code)
//                .filter(t -> !t.getExpiryDate().before(new Date()))
//                .isPresent();
//    }
}
