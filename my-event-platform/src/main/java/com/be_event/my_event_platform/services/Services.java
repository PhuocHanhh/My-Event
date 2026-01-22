package com.be_event.my_event_platform.services;


import com.example.myevent_be.dto.request.ServiceRequest;
import com.example.myevent_be.dto.response.PageResponse;
import com.example.myevent_be.dto.response.ServiceResponse;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.mapper.PageMapper;
import com.example.myevent_be.mapper.ServiceMapper;
import com.example.myevent_be.repository.ServiceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class Services {

    ServiceMapper mapper;
    ServiceRepository repository;
    PageMapper pageMapper;

    @PreAuthorize("hasAuthority('SUPPLIER')")
    public ServiceResponse createService(ServiceRequest request) {

        com.example.myevent_be.entity.Service service = mapper.toService(request);

        log.info("Received ServiceRequest: {}", request);
        log.info("serviceName: {}", request.getName());

        repository.save(service);
        return mapper.toServiceResponse(service);
    }

    public PageResponse getServices(int pageNo, int pageSize) {
        int p = 0;
        if (pageNo > 0) {
            p = pageNo - 1;
        }
        Page<com.example.myevent_be.entity.Service> page = repository.findAll(PageRequest.of(p, pageSize));
        return pageMapper.toPageResponse(page, mapper::toServiceResponse);
    }

    public com.example.myevent_be.entity.Service getServiceById(String id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
    }

    @PreAuthorize("hasAuthority('SUPPLIER')")
    public ServiceResponse updateService(ServiceRequest request, String id) {
        com.example.myevent_be.entity.Service service = getServiceById(id);

        // Cập nhật trường img nếu có giá trị mới
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            service.setImage(request.getImage());
        }
        mapper.updateService(service, request);

        return mapper.toServiceResponse(repository.save(service));
    }

    public ServiceResponse getService(@PathVariable String id) {
        com.example.myevent_be.entity.Service device = getServiceById(id);
        return mapper.toServiceResponse(device);
    }

    //    @PreAuthorize("hasAuthority('ADMIN')")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public void deleteService(String id) {
        com.example.myevent_be.entity.Service device = getServiceById(id);
        repository.delete(device);
    }
}
