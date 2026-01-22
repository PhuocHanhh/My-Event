package com.be_event.my_event_platform.dto.request;

import lombok.Data;

@Data
public class ServiceRentalRequest {

    private String serviceId;
    private Integer quantity;
    private String rentalId;
}