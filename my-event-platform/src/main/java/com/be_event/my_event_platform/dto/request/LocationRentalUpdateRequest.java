package com.be_event.my_event_platform.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class LocationRentalUpdateRequest {

    private String locationName;
    private String address;
    private BigDecimal pricePerDay;
    private Integer quantity;
    private String rentalId;
} 