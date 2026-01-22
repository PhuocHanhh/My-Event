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
@NoArgsConstructor
@Table(name = "event_type")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class EventType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @Nationalized
    String name;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date created_at;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date update_at;

    @OneToMany(mappedBy = "eventType")
//@OneToMany(mappedBy = "event_type")
    Set<Event> event;
}
