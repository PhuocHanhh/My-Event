package com.be_event.my_event_platform.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractRequest {
    String name; // Tên hợp đồng
    String customerName; // Tên khách hàng
    String customerPhone; // Số điện thoại khách hàng
    String address; // Địa chỉ đầy đủ
    String rentalId; // rentalId nếu cần liên kết
    String status; // Trạng thái hợp đồng
    String paymentIntentId;
}
