package com.be_event.my_event_platform.controller;


import com.example.myevent_be.dto.request.ServiceRequest;
import com.example.myevent_be.dto.response.*;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.service.ImageStorageService;
import com.example.myevent_be.service.Services;
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
@RequestMapping("/services")
@Validated
@Slf4j
@RequiredArgsConstructor
public class ServiceController {

    private final Services services;
    private final ImageStorageService storageService;

    private static final String ERROR_MESSAGE = "errorMessage={}";

    // Lấy danh sách dịch vụ
    @GetMapping("/list")
    public ResponseData<PageResponse> getServices(@RequestParam(defaultValue = "0", required = false) int pageNo,
                                                 @Min(5) @RequestParam(defaultValue = "20", required = false) int pageSize) {
        log.info("Request get services, pageNo={}, pageSize={}", pageNo, pageSize);

        try {
            PageResponse<?> service = services.getServices(pageNo, pageSize);
            return new ResponseData<>(HttpStatus.OK.value(), "success", service);
        } catch (Exception e) {
            log.error(ERROR_MESSAGE,e.getMessage(),e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        }
    }

    // Lấy chi tiết dịch vụ
    @GetMapping("/{id}")
    public ResponseData<ServiceResponse> getServiceById(@PathVariable String id) {
        log.info("Request get service detail, serviceId={}", id);

        try {
            ServiceResponse service = services.getService(id);
            return new ResponseData<>(HttpStatus.OK.value(), "service", service);
        } catch (Exception e) {
            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        }
    }


    @PostMapping(value = "/new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseData<ServiceResponse> createService(@RequestPart("file") MultipartFile file,
              @RequestPart("service") @Valid ServiceRequest request) {
        log.info("Request add service, {}",request.getName());
//        try {
//            ServiceResponse response = services.createService(request);
//            return new ResponseData<>(HttpStatus.CREATED.value(), "Service added successfully",response);
//        }catch (Exception e){
//            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "Service added fail");
//        }
        try {
            // Store the uploaded file
            String fileName = storageService.storeFile(file);
            log.info("File stored successfully with name: {}", fileName);

            // Set the image path in the request
            request.setImage(fileName);

            ServiceResponse response = services.createService(request);
            log.info("Event created successfully: {}", response);
            return new ResponseData<>(HttpStatus.CREATED.value(), "Service added successfully",response);
        } catch (Exception e) {
            log.error("Error creating event: ", e);
            if (e instanceof AppException) {
                throw e;
            }
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseData<Void> updateService(@PathVariable String id,
              @RequestPart(value = "file", required = false) MultipartFile file,
              @RequestPart("service") @Valid ServiceRequest request){
        log.info("Request update ServiceId={}", id);
//        try {
//            services.updateService(request,id);
//            return new ResponseData<>(HttpStatus.ACCEPTED.value(), "Service updated successfully");
//        } catch (Exception e) {
//            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
//            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "Update Service fail");
//        }
        try {
            // Store the uploaded file
            String fileName = storageService.storeFile(file);
            log.info("File stored successfully with name: {}", fileName);

            // Set the image path in the request
            request.setImage(fileName);

            ServiceResponse response = services.updateService(request, id);
            log.info("Event created successfully: {}", response);
            return new ResponseData<>(HttpStatus.ACCEPTED.value(), "Service updated successfully");
        } catch (Exception e) {
            log.error("Error creating event: ", e);
            if (e instanceof AppException) {
                throw e;
            }
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseData<Void> deleteService(@PathVariable String id) {
        log.info("Request delete ServiceID={}", id);

        try {
            services.deleteService(id);
            return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Service deleted successfully");
        } catch (Exception e) {
            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "Delete Service fail");
        }
    }
}
