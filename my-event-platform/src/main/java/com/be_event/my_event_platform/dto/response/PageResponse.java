package com.be_event.my_event_platform.dto.response;


import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class PageResponse<T> {
    int pageNo;
    int pageSize;
    int totalPage;
    T items;
}
