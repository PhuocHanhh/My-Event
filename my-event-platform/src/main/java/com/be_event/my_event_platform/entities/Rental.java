package com.be_event.my_event_platform.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Set;

@Data
@NoArgsConstructor
@Table(name = "rental")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    User user;

    BigDecimal total_price;
    Date rental_start_time;
    Date rental_end_time;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date create_at;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date update_at;
    String custom_location;

    @ManyToOne
    @JoinColumn(name = "event_id")
    Event event;

    @OneToMany(mappedBy = "rental")
    Set<LocationRental> location;

    @OneToMany(mappedBy = "rental")
    Set<ServiceRental> service_rentals;

    @OneToMany(mappedBy = "rental")
    Set<DeviceRental> device_rentals;

    @OneToMany(mappedBy = "rental")
    Set<Contract> contract;

    @OneToMany(mappedBy = "rental")
    Set<TimeLine> timeLines;

}
