package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.response.RoleResponse;
import com.example.myevent_be.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Named("roleToString")
    default String roleToString(Role role) {
        return role != null ? role.getName() : null;
    }

    RoleResponse toRoleResponse(Role role);
}
