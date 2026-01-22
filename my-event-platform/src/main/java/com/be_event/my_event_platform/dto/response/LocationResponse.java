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
public class LocationResponse {
    String id;
    String name;
    String description;
    String image;
    BigDecimal hourly_rental_fee;
    String address;
    Date created_at;
    Date update_at;
    String userID;
}
