package com.be_event.my_event_platform.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;

@Data
@NoArgsConstructor
@Builder
@Table(name = "token")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    String access_token;
    String refresh_token;
    String email;

//    @Version
//    private Integer version; // Hibernate sẽ dùng để kiểm tra xung đột dữ liệu

    Date last_date;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date create_at;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date update_at;

}
