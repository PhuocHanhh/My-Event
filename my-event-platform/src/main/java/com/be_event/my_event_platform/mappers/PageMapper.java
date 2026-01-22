package com.be_event.my_event_platform.mappers;

import com.example.myevent_be.dto.response.PageResponse;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

@Mapper(componentModel = "spring")
public interface PageMapper {
    default <T, R> PageResponse toPageResponse(Page<T> page, Function<T, R> mapper) {
        List<R> items = page.getContent()
                .stream()
                .map(mapper)
                .toList();

        return PageResponse.builder()
                .pageNo(page.getNumber())
                .pageSize(page.getSize())
                .totalPage(page.getTotalPages())
                .items(items)
                .build();
    }
}
