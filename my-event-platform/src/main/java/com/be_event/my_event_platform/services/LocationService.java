package com.be_event.my_event_platform.services;


import com.example.myevent_be.dto.request.LocationRequest;
import com.example.myevent_be.dto.response.LocationResponse;
import com.example.myevent_be.dto.response.PageResponse;
import com.example.myevent_be.entity.Location;
import com.example.myevent_be.exception.ResourceNotFoundException;
import com.example.myevent_be.mapper.LocationMapper;
import com.example.myevent_be.mapper.PageMapper;
import com.example.myevent_be.repository.LocationRepository;
import com.example.myevent_be.repository.UserRepository;
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
public class LocationService {
    LocationMapper mapper;
    LocationRepository repository;
    UserRepository userRepository;
    PageMapper pageMapper;

    @PreAuthorize("hasAuthority('SUPPLIER')")
    public LocationResponse createLocation(LocationRequest request) {

        Location location = mapper.toLocation(request);

        log.info("Received LocationRequest: {}", request);

        repository.save(location);
        return mapper.toLocationResponse(location);
    }

    public PageResponse getLocations(int pageNo, int pageSize) {
        int p = 0;
        if (pageNo > 0) {
            p = pageNo - 1;
        }
        Page<Location> page = repository.findAll(PageRequest.of(p, pageSize));
        return pageMapper.toPageResponse(page, mapper::toLocationResponse);
    }

    public Location getLocationById(String id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
    }

    @PreAuthorize("hasAuthority('SUPPLIER')")
    public LocationResponse updateLocation(LocationRequest request, String id) {
        Location location = getLocationById(id);

        // Cập nhật trường img nếu có giá trị mới
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            location.setImage(request.getImage());
        }
        mapper.upDateLocation(location, request);

        return mapper.toLocationResponse(repository.save(location));
    }

    public LocationResponse getLocation(@PathVariable String id) {
        Location location = getLocationById(id);
        return mapper.toLocationResponse(location);
    }

    //    @PreAuthorize("hasAuthority('ADMIN')")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public void deleteLocation(String id) {
        Location location = getLocationById(id);
        repository.delete(location);
    }
}
