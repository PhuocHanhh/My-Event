package com.be_event.my_event_platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeviceResponse {
    private String id;
    private String name;
    private String description;
    private String image;
    private BigDecimal hourlyRentalFee;
    private int quantity;
    private String place;
    private String deviceType_name;
    private String userID;
    private Date created_at;
    private Date update_at;
}
