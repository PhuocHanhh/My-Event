package com.be_event.my_event_platform.services;

import com.example.myevent_be.exception.AppException;
import com.example.myevent_be.exception.ErrorCode;
import com.example.myevent_be.repository.IStorageService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Stream;

@Primary
@Service
@Slf4j
public class ImageStorageService implements IStorageService {
    private final Path storageFolder;

    public ImageStorageService(@Value("${app.upload.dir:E:/KLTN/MYEVENT/myevent/upload/event-images}") String uploadDir) {
        this.storageFolder = Paths.get(uploadDir);
        try {
            Files.createDirectories(storageFolder);
            log.info("Storage directory initialized at: {}", storageFolder.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to create storage directory", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        try {
            if (file.isEmpty()) throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            if (!isImageFile(file)) throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            if ((file.getSize() / 1_000_000.0f) > 5.0f) throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);

            String ext = FilenameUtils.getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID().toString().replace("-", "") + "." + ext;
            Path destination = this.storageFolder.resolve(filename).normalize().toAbsolutePath();

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
                log.info("File saved at: {}", destination);
                return filename;
            }
        } catch (IOException e) {
            log.error("Failed to store file", e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    private boolean isImageFile(MultipartFile file) {
        String ext = FilenameUtils.getExtension(file.getOriginalFilename());
        return Arrays.asList("png", "jpg", "jpeg", "bmp")
                .contains(ext != null ? ext.trim().toLowerCase() : "");
    }

    @Override
    public byte[] readFileContent(String fileName) {
        try {
            Path file = storageFolder.resolve(fileName);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                byte[] bytes = StreamUtils.copyToByteArray(resource.getInputStream());
                log.info("Successfully read file: {}", fileName);
                return bytes;
            }
            log.error("Could not read file: {}", fileName);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        } catch (IOException e) {
            log.error("Error reading file: {}", fileName, e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public Stream<Path> loadAll() {
        try {
            return Files.walk(this.storageFolder, 1)
                    .filter(path -> !path.equals(this.storageFolder))
                    .map(this.storageFolder::relativize);
        } catch (IOException e) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }

    @Override
    public void deleteAllFiles() {
    }
}
