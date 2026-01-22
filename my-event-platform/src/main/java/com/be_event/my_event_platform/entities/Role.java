package com.be_event.my_event_platform.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;
import java.util.Set;

@Data
@NoArgsConstructor
@Table(name = "role")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String name;
//    @Enumerated(EnumType.STRING) // Thêm annotation này để ánh xạ Enum dưới dạng chuỗi
//    @Column(name = "name", columnDefinition = "NVARCHAR(50)")
//    com.example.myevent_be.enums.Role name;
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP) // Xác định kiểu thời gian
    @Column(updatable = false)
    Date created_at;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date update_at;

    @OneToMany(mappedBy = "role")
    Set<User> users;
}
