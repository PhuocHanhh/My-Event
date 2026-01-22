package com.be_event.my_event_platform.dto.response;

import com.example.myevent_be.entity.Contract;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.Set;

@Data
@Table(name = "customer")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerResponse {

    String id;
    String name;
    String phoneNumber;
    String address;
    Date create_at;
    Date update_at;
    Set<Contract> contracts ;
}
