package com.be_event.my_event_platform.mappers;


import com.example.myevent_be.dto.request.ServiceRequest;
import com.example.myevent_be.dto.response.ServiceResponse;
import com.example.myevent_be.entity.Service;
import com.example.myevent_be.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring",uses = UserMapper.class)
public interface ServiceMapper {
    @Mapping(source = "userID", target = "user", qualifiedByName = "mapUserById")
    Service toService (ServiceRequest request);
    @Mapping(source = "user.id", target = "userID")
    ServiceResponse toServiceResponse (Service service);
    void updateService (@MappingTarget Service service, ServiceRequest request);
    @Named("mapUserById")
    default User mapUserById(String userid) {
        if (userid == null) return null;
        User user = new User();
        user.setId(userid);
        return user;
    }
}
