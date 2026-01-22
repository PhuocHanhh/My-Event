package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.request.ResetPasswordRequest2;
import com.example.myevent_be.dto.request.UserCreateRequest;
import com.example.myevent_be.dto.request.UserUpdateRequest;
import com.example.myevent_be.dto.response.UserResponse;
import com.example.myevent_be.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = RoleMapper.class,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {

    User toUser(UserCreateRequest request);

//    @Mapping(target = "roleName", source = "role")
    @Mapping(source = "role", target = "roleName", qualifiedByName = "roleToString")
    @Mapping(source = "phoneNumber", target = "phone_number")
    UserResponse toUserResponse(User user);

    void updateUser(@MappingTarget User user, UserUpdateRequest request);
    void resetPssword(@MappingTarget User user, ResetPasswordRequest2 request);

}
