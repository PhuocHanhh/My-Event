package com.be_event.my_event_platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventCreateRequest {

    @NotBlank(message = "Name is required")
    String name;
    
    String description;
    String detail;
    String img;
    
    @NotNull(message = "event_format must be specified")
    boolean event_format;
    
    @NotNull(message = "is_template must be specified")
    boolean is_template;
    
    String online_link;
    String invitation_link;
    
    @NotBlank(message = "eventType_id is required")
    String eventType_id;

    //xx"name": "Test Event",x
    // x   "description": "This is a test event",
    //  x  "detail": "Event details",
    //   x "event_format": true,
    //   x "is_template": false,
    //   x "eventType_id": "some-uuid-here", // Copy id từ response của bước tạo EventType
    //   x "online_link": "https://example.com",
    //   x "invitation_link": "https://example.com/invite"
}
