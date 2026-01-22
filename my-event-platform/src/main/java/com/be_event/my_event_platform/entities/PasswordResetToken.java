package com.be_event.my_event_platform.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@Table(name = "password_reset_token")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class PasswordResetToken {

    @Id
    @Column(name = "token")
    String token;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;
    
    @Column(name = "expiry_date")
    Date expiryDate;
}
