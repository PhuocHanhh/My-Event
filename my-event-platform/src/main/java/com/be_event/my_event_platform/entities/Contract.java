package com.be_event.my_event_platform.entities;

import com.example.myevent_be.enums.ContractStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Nationalized;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;
import java.util.Set;

@Data
@Table(name = "contract")
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "rental_id")
    Rental rental;

    @Nationalized
    String name;

    @Column(name = "payment_intent_id")
    String paymentIntentId;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    ContractStatus status;
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date create_at;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    Date update_at;

    @OneToMany(mappedBy = "contract")
    Set<EmailSendLog> emailSendLogs;
}