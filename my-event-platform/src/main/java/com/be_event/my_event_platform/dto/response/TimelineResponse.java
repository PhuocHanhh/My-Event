package com.be_event.my_event_platform.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TimelineResponse {

    String id;
    String description;
    Date time_start;
    Date create_at;
    Date update_at;
    String rental_id;
}
