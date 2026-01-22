package com.be_event.my_event_platform.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LogoutRequest { // là một Data Transfer Object (DTO) được sử dụng để truyền dữ liệu trong ứng dụng,
    // đặc biệt là khi bạn muốn gửi yêu cầu kiểm tra tính hợp lệ hoặc trạng thái của một token (ví dụ như JWT token).
    String token;
}
