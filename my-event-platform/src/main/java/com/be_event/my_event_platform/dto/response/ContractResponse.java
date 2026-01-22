package com.be_event.my_event_platform.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractResponse {

    String id;
    String name;
    String customerName;
    String customerPhone;
    String address;
    String status;
    String paymentIntentId;
    String rentalId;
    Date createdAt;
    Date updatedAt;
}
