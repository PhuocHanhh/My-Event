package com.be_event.my_event_platform.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AIResponse {
    String message;
    List<String> eventTypes;
    List<EventResponse> events;
}
