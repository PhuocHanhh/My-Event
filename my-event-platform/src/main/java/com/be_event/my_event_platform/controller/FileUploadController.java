package com.be_event.my_event_platform.controller;

import com.example.myevent_be.dto.response.ApiResponse;
import com.example.myevent_be.service.ImageStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:5500",
        "http://localhost:8080"}, allowCredentials = "true")
@RequestMapping("/api/v1/FileUpload")
public class FileUploadController {

    @Autowired
    private ImageStorageService storageService;

    @PostMapping("")
    public ResponseEntity<ApiResponse> uploadFile(@RequestParam("file")MultipartFile file) {
        try {
            String generatedFileName = storageService.storeFile(file);
            return ResponseEntity.status(HttpStatus.OK).body(
                    new ApiResponse(1000, "upload file successfully", generatedFileName)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body(
                    new ApiResponse(9999, e.getMessage(), "")
            );
        }
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<?> readDetailFile(@PathVariable String fileName) {
        try {
            byte[] bytes = storageService.readFileContent(fileName);
            if (bytes == null || bytes.length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(new ApiResponse(9999, "File not found: " + fileName, null));
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentLength(bytes.length);
            headers.set("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
            headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
            headers.set("Access-Control-Allow-Headers", "*");
            headers.set("Access-Control-Allow-Credentials", "true");
            
            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse(9999, "Error reading file: " + exception.getMessage(), null));
        }
    }

    @GetMapping("/avatar/{fileName:.+}")
    public ResponseEntity<?> getAvatar(@PathVariable String fileName) {
        try {
            byte[] bytes = storageService.readFileContent(fileName);
            if (bytes == null || bytes.length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(new ApiResponse(9999, "Avatar not found: " + fileName, null));
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentLength(bytes.length);
            headers.set("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
            headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
            headers.set("Access-Control-Allow-Headers", "*");
            headers.set("Access-Control-Allow-Credentials", "true");
            
            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        } catch (Exception exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ApiResponse(9999, "Error reading avatar: " + exception.getMessage(), null));
        }
    }

    @GetMapping("")
    public ResponseEntity<ApiResponse> getUploadedFiles() {
        try {
            List<String> urls = storageService.loadAll()
                    .map(path -> {
                        String urlPath = MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
                                "readDetailFile", path.getFileName().toString()).build().toUri().toString();
                        return urlPath;
                    }).collect(Collectors.toList());
            return ResponseEntity.ok(new ApiResponse(1000, "List files successfully", urls));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse(1000, "List files failed", new String[] {}));
        }
    }
}
