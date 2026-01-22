package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.request.DeviceRequest;
import com.example.myevent_be.dto.response.*;
import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.service.DeviceService;
import com.example.myevent_be.service.ImageStorageService;
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
@RequestMapping("/devices")
@Validated
@Slf4j
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final ImageStorageService storageService;

    private static final String ERROR_MESSAGE = "errorMessage={}";

    // Lấy danh sách thiết bị
    @GetMapping("/list")
    public ResponseData<PageResponse> getDevices(@RequestParam(defaultValue = "0", required = false) int pageNo,
                                                 @Min(5) @RequestParam(defaultValue = "20", required = false) int pageSize) {
        log.info("Request get devices, pageNo={}, pageSize={}", pageNo, pageSize);

        try {
            PageResponse<?> device = deviceService.getDevices(pageNo, pageSize);
            return new ResponseData<>(HttpStatus.OK.value(), "success", device);
        } catch (Exception e) {
            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        }
    }

    // Lấy chi tiết thiết bị
    @GetMapping("/{id}")
    public ResponseData<DeviceResponse> getDeviceById(@PathVariable String id) {
        log.info("Request get device detail, deviceId={}", id);

        try {
            DeviceResponse device = deviceService.getDevice(id);
            return new ResponseData<>(HttpStatus.OK.value(), "device", device);
        } catch (Exception e) {
            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        }
    }


    //@PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping(value = "/new", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseData<DeviceResponse> createDevice(@RequestPart("file") MultipartFile file,
                             @RequestPart("device") @Valid DeviceRequest request) {
        log.info("Request add Device, {}", request.getName());

//        try {
//            DeviceResponse deviceResponse = deviceService.createDevice(request);
//            return new ResponseData<>(HttpStatus.CREATED.value(), "Device added successfully", deviceResponse);
//        } catch (Exception e) {
//            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "Device added fail");
//        }
        try {
            // Store the uploaded file
            String fileName = storageService.storeFile(file);
            log.info("File stored successfully with name: {}", fileName);

            // Set the image path in the request
            request.setImage(fileName);

            DeviceResponse response = deviceService.createDevice(request);
            log.info("Event created successfully: {}", response);
//            return ApiResponse.<DeviceResponse>builder()
//                    .result(response)
//                    .build();
            return new ResponseData<>(HttpStatus.CREATED.value(),
                    "Device added successfully", response);
        } catch (Exception e) {
            log.error("Error creating event: ", e);
            if (e instanceof AppException) {
                throw e;
            }
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    // Chỉ Admin mới được cập nhật thiết bị
//    @PreAuthorize("hasAuthority('SUPPLIER')")
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseData<Void> updateDevice(@PathVariable String id,
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestPart("device") @Valid DeviceRequest request) {
        log.info("Request update DeviceId={}", id);
//        try {
//            deviceService.updateDevice(request, id);
//            return new ResponseData<>(HttpStatus.ACCEPTED.value(), "Device updated successfully");
//        } catch (Exception e) {
//            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
//            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "Update device fail");
//        }
        try {
            // Store the uploaded file
            String fileName = storageService.storeFile(file);
            log.info("File stored successfully with name: {}", fileName);

            // Set the image path in the request
            request.setImage(fileName);

            DeviceResponse response = deviceService.updateDevice(request, id);
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

    // Chỉ Admin mới được xóa thiết bị
//    @PreAuthorize("hasAuthority('MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseData<Void> deleteDevice(@PathVariable String id) {
        log.info("Request delete deviceId={}", id);

        try {
            deviceService.deleteDevice(id);
            return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "Device deleted successfully");
        } catch (Exception e) {
            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "Delete device fail");
        }
    }
}
