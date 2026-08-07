package com.dev.hotel_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final String HOTEL_UPLOAD_DIR = "uploads/hotels/";
    private static final String ROOM_UPLOAD_DIR = "uploads/rooms/";

    public String uploadHotelImage(MultipartFile file) {

        return saveFile(file, HOTEL_UPLOAD_DIR);
    }

    public String uploadRoomImage(MultipartFile file) {

        return saveFile(file, ROOM_UPLOAD_DIR);
    }

    private String saveFile(MultipartFile file, String uploadDir) {

        try {

            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();

            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(
                        originalFilename.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return uploadDir + fileName;

        } catch (IOException e) {

            throw new RuntimeException("Image upload failed");
        }
    }
}