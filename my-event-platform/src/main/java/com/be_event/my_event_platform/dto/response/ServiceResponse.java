package com.be_event.my_event_platform.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.Date;

@Builder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceResponse {
    String id;
    String name;
    String description;
    String image;
    BigDecimal hourly_salary;
    int quantity;
    String place;
    String userID;
    Date created_at;
    Date update_at;
}
