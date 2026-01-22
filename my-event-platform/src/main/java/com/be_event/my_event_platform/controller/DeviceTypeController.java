package com.be_event.my_event_platform.controller;


import com.example.myevent_be.dto.request.DeviceTypeRequest;
import com.example.myevent_be.dto.response.DeviceTypeResponse;
import com.example.myevent_be.dto.response.PageResponse;
import com.example.myevent_be.dto.response.ResponseData;
import com.example.myevent_be.dto.response.ResponseError;
import com.example.myevent_be.service.DeviceTypeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/deviceType")
@Validated
@Slf4j
@RequiredArgsConstructor
public class DeviceTypeController {
    @Autowired
    private final DeviceTypeService deviceTypeService;
    private static final String ERROR_MESSAGE = "errorMessage={}";

    @GetMapping("/list")
    public ResponseData<PageResponse> getDeviceTypes(@RequestParam(defaultValue = "0", required = false) int pageNo,
                                                  @Min(5) @RequestParam(defaultValue = "20", required = false) int pageSize) {
        log.info("Request get device list, pageNo={}, pageSize={}", pageNo, pageSize);

        try {
            PageResponse<?> deviceType = deviceTypeService.getDeviceTypes(pageNo, pageSize);
            return new ResponseData<>(HttpStatus.OK.value(), "success", deviceType);
        } catch (Exception e) {
            log.error(ERROR_MESSAGE,e.getMessage(),e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        }
    }

    @PostMapping(value = "/")
    public ResponseData<DeviceTypeResponse> addDeviceType(@Valid @RequestBody DeviceTypeRequest request) {
        log.info("Request add DeviceType, {}",request.getName());

        try {
            DeviceTypeResponse deviceType = deviceTypeService.createDeviceType(request);
            return new ResponseData<>(HttpStatus.CREATED.value(), "DeviceType added successfully", deviceType);
        } catch (Exception e) {
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "DeviceType added fail");
        }
    }

    @DeleteMapping("/{deviceTypeId}")
    public ResponseData<Void> deleteDeviceType(@PathVariable String deviceTypeId) {
        log.info("Request delete deviceTypeId={}", deviceTypeId);

        try {
            deviceTypeService.deleteDeviceType(deviceTypeId);
            return new ResponseData<>(HttpStatus.NO_CONTENT.value(), "DeviceType deleted successfully");
        } catch (Exception e) {
            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), "Delete deviceType fail");
        }
    }

    @GetMapping("/{deviceTypeId}")
    public ResponseData<DeviceTypeResponse> getDeviceType(@PathVariable String deviceTypeId) {
        log.info("Request get deviceType detail, deviceTypeId={}", deviceTypeId);

        try {
            DeviceTypeResponse deviceType = deviceTypeService.getDeviceType(deviceTypeId);
            return new ResponseData<>(HttpStatus.OK.value(), "deviceType", deviceType);
        } catch (Exception e) {
            log.error(ERROR_MESSAGE, e.getMessage(), e.getCause());
            return new ResponseError(HttpStatus.BAD_REQUEST.value(), e.getMessage());
        }
    }
}
