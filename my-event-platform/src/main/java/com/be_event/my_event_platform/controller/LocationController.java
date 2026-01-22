package com.be_event.my_event_platform.controller;


import com.example.myevent_be.dto.request.LocationRequest;
import com.example.myevent_be.dto.response.*;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.service.ImageStorageService;
import com.example.myevent_be.service.LocationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/locations")
@Validated
@Slf4j
@RequiredArgsConstructor
public class LocationController {
    private final LocationService locationService;
    private final ImageStorageService storageService;

    private static final String ERROR_MESSAGE = "errorMessage={}";

    @GetMapping("/list")
    public ResponseData<PageResponse> getLocations(@RequestParam(defaultValue = "0", required = false) int pageNo,
                                                 @Min(5) @RequestParam(defaultValue = "20", required = false) int pageSize) {
        log.info("Request get location, pageNo={}, pageSize={}", pageNo, pageSize);

        try {
            PageResponse<?> location = locationService.getLocations(pageNo, pageSize);
            return new ResponseData<>(HttpStatus.OK.value(), "success", location);
        } catch (Exception e) {
            log.error(ERROR_MESSAGE,e.getMessage(),e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        }
    }

    // Lấy chi tiết địa điểm
    @GetMapping("/{id}")
    public ResponseData<LocationResponse> getLocationById(@PathVariable String id) {
        log.info("Request get location detail, locationId={}", id);

        try {
            LocationResponse location = locationService.getLocation(id);
            return new ResponseData<>(HttpStatus.OK.value(), "location", location);
        } catch (Exception e) {
            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        }
    }


    @PostMapping(value = "/new")
    public ResponseData<LocationResponse> createLocation(@RequestPart("file") MultipartFile file,
               @RequestPart("service")@Valid LocationRequest request) {
        log.info("Request add location, {}",request.getName());

//        try {
//            LocationResponse locationResponse = locationService.createLocation(request);
//            return new ResponseData<>(HttpStatus.CREATED.value(), "location added successfully",locationResponse);
//        }catch (Exception e){
//            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "location added fail");
//        }
        try {
            // Store the uploaded file
            String fileName = storageService.storeFile(file);
            log.info("File stored successfully with name: {}", fileName);

            // Set the image path in the request
            request.setImage(fileName);

            LocationResponse response = locationService.createLocation(request);
            log.info("Event created successfully: {}", response);
            return new ResponseData<>(HttpStatus.CREATED.value(), "location added successfully");
        } catch (Exception e) {
            log.error("Error creating event: ", e);
            if (e instanceof AppException) {
                throw e;
            }
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    // Chỉ Admin mới được cập nhật địa điểm
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseData<Void> updateLocation(@PathVariable String id,
                @RequestPart(value = "file", required = false) MultipartFile file,
                @RequestPart("location") @Valid  LocationRequest request){
        log.info("Request update LocationId={}", id);
//        try {
//            locationService.updateLocation(request,id);
//            return new ResponseData<>(HttpStatus.ACCEPTED.value(), "location updated successfully");
//        } catch (Exception e) {
//            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
//            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "Update location fail");
//        }
        try {
            // Store the uploaded file
            String fileName = storageService.storeFile(file);
            log.info("File stored successfully with name: {}", fileName);

            // Set the image path in the request
            request.setImage(fileName);

            LocationResponse response = locationService.updateLocation(request, id);
            log.info("Device created successfully: {}", response);
            return new ResponseData<>(HttpStatus.ACCEPTED.value(), "Device updated successfully");
        } catch (Exception e) {
            log.error("Error creating event: ", e);
            if (e instanceof AppException) {
                throw e;
            }
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    // Chỉ Admin mới được xóa địa điểm
    @DeleteMapping("/{id}")
    public ResponseData<Void> deleteLocation(@PathVariable String id) {
        log.info("Request delete locationId={}", id);

        try {
            locationService.deleteLocation(id);
            return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "location deleted successfully");
        } catch (Exception e) {
            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "Delete location fail");
        }
    }
}
