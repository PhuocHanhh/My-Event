package com.be_event.my_event_platform.dto.response;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@Table(name = "event")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EventResponse {

    String id;
    String name;
    String description;
    String detail;
    String img;
    boolean event_format;
    boolean is_template;
    String online_link;
    String invitation_link;
    Date created_at;
    Date update_at;
    String eventTypeName;
    String eventTypeID;

}
