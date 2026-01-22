package com.be_event.my_event_platform.entities;

import com.example.myevent_be.validater.ValidPhoneNumber;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@Table(name = "users")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Nationalized
    String first_name;
    @Nationalized
    String last_name;

    @Email(message = "Email không hợp lệ")
    String email;

    @Size(min = 8)
    String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    Role role;

    String avatar;
    @ValidPhoneNumber
    String phoneNumber;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(updatable = false)
    Date created_at;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date update_at;

    @OneToMany(mappedBy = "user")
    Set<Token> tokens;

    @OneToMany(mappedBy = "id")
    Set<Device> devices;

    @OneToMany(mappedBy = "id")
    Set<Service> services;

    @OneToMany(mappedBy = "id")
    Set<Location> locations;

    @Column(nullable = true)
    private Boolean isVerified = false; // Mặc định là chưa xác minh
}
