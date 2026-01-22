package com.be_event.my_event_platform.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.sql.Date;

@Data
@SuperBuilder
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceRentalResponse {

    String id;
    String serviceName;
    String supplierName;
    BigDecimal pricePerDay;
    Integer quantity;
    BigDecimal totalPrice;
    Date create_at;
    Date update_at;
    String rental_id;
    String image;
    String serviceID;
    
}
