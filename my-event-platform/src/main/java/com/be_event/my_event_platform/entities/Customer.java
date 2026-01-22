package com.be_event.my_event_platform.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;
import java.util.Set;

@Data
@Table(name = "customer")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Nationalized
    String name;
    String phoneNumber;
    @Nationalized
    String address;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date create_at;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date update_at;

    @OneToMany(mappedBy = "customer")
    Set<Contract> contracts;
}
