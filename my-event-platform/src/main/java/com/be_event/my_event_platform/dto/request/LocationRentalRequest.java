package com.be_event.my_event_platform.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;


@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LocationRentalRequest {

    String locationId;
    String rentalId;
    Integer quantity;
} 