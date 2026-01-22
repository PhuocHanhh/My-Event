package com.be_event.my_event_platform.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@Table(name = "user_verification_requests")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class UserVerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "email")
    String email;

    @Column(name = "data")
    String data;

    @Column(name = "code")
    String code;

    @Column(name = "token")
    String token;

    @Column(name = "expiration_time")
    @Temporal(TemporalType.TIMESTAMP)
    Date expirationTime;

    @Column(name = "type")
    String type;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at")
    Date createdAt;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    Date updatedAt;
}
