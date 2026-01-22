package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.LocationRequest;
import com.example.myevent_be.dto.response.LocationResponse;
import com.example.myevent_be.entity.Location;
import com.example.myevent_be.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring",uses = UserMapper.class)
public interface LocationMapper {
    @Mapping(source = "userID", target = "user", qualifiedByName = "mapUserById")
    Location toLocation(LocationRequest request);
    @Mapping(source = "user.id", target = "userID")
    LocationResponse toLocationResponse(Location location);
    void upDateLocation (@MappingTarget Location location,LocationRequest request);
    @Named("mapUserById")
    default User mapUserById(String userid) {
        if (userid == null) return null;
        User user = new User();
        user.setId(userid);
        return user;
    }
}
