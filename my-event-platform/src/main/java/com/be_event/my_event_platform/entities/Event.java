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
@Table(name = "event")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Nationalized
    String name;
    @Nationalized
    String description;
    @Nationalized
    String detail;
    String img;
    boolean event_format;
    boolean is_template;
    String online_link;
    String invitation_link;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date created_at;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date update_at;

    @ManyToOne
    @JoinColumn(name = "eventType_id", referencedColumnName = "id", nullable = false)
//    EventType event_type;
    EventType eventType;

    @OneToMany(mappedBy = "event")
    Set<Rental> rentals;

//    @Column(name = "location_type")
//    private String locationType; // "outdoor" hoặc "indoor"
//
//    @Column(name = "max_guests")
//    private Integer maxGuests; // Số lượng khách mời tối đa
}
