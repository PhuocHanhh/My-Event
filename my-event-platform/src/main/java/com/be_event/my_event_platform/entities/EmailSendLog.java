package com.be_event.my_event_platform.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.Set;

@Data
@Table(name = "email_send_log")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class EmailSendLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne
    @JoinColumn(name = "contract_id")
    Contract contract;

    String fileName;
    Date creatAt;
    Date updateAt;

    @OneToMany(mappedBy = "emailSendLog")
    Set<Guest> guests;
}
