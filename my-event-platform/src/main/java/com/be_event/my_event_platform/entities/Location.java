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

import java.math.BigDecimal;
import java.util.Date;
import java.util.Set;

@Data
@NoArgsConstructor
@Table(name = "location")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @Nationalized
    String name;
    @Nationalized
    String description;
    String image;
    BigDecimal hourly_rental_fee;
    @Nationalized
    String address;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date created_at;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date update_at;

    @OneToMany(mappedBy = "location")
    Set<LocationRental> locationRentals;

    @ManyToOne
    @JoinColumn(name="userid",referencedColumnName = "id",nullable = false,columnDefinition = "VARCHAR(255) DEFAULT 'DEFAULT_TYPE_ID'")
    User user;
}
