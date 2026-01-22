package com.be_event.my_event_platform.dto.response;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;

    String first_name;
    String last_name;
    String email;
    String avatar;
    String phone_number;
    Date created_at;
    Date update_at;
    String roleName; // Chỉ lấy tên role

}
