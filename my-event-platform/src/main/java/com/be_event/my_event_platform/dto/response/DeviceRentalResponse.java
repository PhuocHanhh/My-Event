package com.be_event.my_event_platform.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.Date;

@Data
@SuperBuilder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DeviceRentalResponse {
    String id;
    String deviceTypeName;
    String deviceName;
    String supplierName;
    BigDecimal pricePerDay;
    Integer quantity;
    BigDecimal totalPrice;
    Date create_at;
    Date update_at;
    String rental_id;
    String image;
    String deviceID;
}