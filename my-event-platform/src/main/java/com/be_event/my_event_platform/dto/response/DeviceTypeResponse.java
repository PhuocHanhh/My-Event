package com.be_event.my_event_platform.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Date;

@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class DeviceTypeResponse implements Serializable{
    String id;
    String name;
    Date create_at;
    Date update_at;
}
