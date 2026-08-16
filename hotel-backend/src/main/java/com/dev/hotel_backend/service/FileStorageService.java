package com.dev.hotel_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final String HOTEL_FOLDER = "hotels";
    private static final String ROOM_FOLDER = "rooms";

    private final Path uploadRoot =
            Paths.get(
                    System.getProperty("user.dir"),
                    "uploads"
            );

    // =====================================================
    // HOTEL IMAGE
    // =====================================================

    public String uploadHotelImage(
            MultipartFile file
    ) {

        return saveFile(
                file,
                HOTEL_FOLDER
        );
    }

    // =====================================================
    // ROOM IMAGE
    // =====================================================

    public String uploadRoomImage(
            MultipartFile file
    ) {

        return saveFile(
                file,
                ROOM_FOLDER
        );
    }

    // =====================================================
    // SAVE FILE
    // =====================================================

    private String saveFile(
            MultipartFile file,
            String folder
    ) {

        if (file == null || file.isEmpty()) {

            throw new RuntimeException(
                    "Image file is empty."
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null ||
                !contentType.startsWith("image/")) {

            throw new RuntimeException(
                    "Only image files are allowed."
            );
        }

        try {

            // ---------------------------------------------
            // Create upload directory
            // ---------------------------------------------

            Path uploadPath =
                    uploadRoot.resolve(folder);

            Files.createDirectories(
                    uploadPath
            );

            System.out.println(
                    "UPLOAD PATH: "
                            + uploadPath
                            .toAbsolutePath()
            );

            // ---------------------------------------------
            // Original filename
            // ---------------------------------------------

            String originalFilename =
                    file.getOriginalFilename();

            String extension = "";

            if (originalFilename != null &&
                    originalFilename.contains(".")) {

                extension =
                        originalFilename.substring(
                                originalFilename
                                        .lastIndexOf(".")
                        ).toLowerCase();
            }

            // ---------------------------------------------
            // Unique filename
            // ---------------------------------------------

            String fileName =
                    UUID.randomUUID()
                            + extension;

            Path filePath =
                    uploadPath.resolve(fileName)
                            .normalize();

            // ---------------------------------------------
            // Save file
            // ---------------------------------------------

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            System.out.println(
                    "IMAGE UPLOAD SUCCESS"
            );

            System.out.println(
                    "FILE: "
                            + filePath
                            .toAbsolutePath()
            );

            // ---------------------------------------------
            // Return browser URL
            // ---------------------------------------------

            return "http://localhost:8080/uploads/"
                    + folder
                    + "/"
                    + fileName;

        } catch (IOException e) {

            // VERY IMPORTANT:
            // Print actual backend error

            e.printStackTrace();

            throw new RuntimeException(
                    "Image upload failed: "
                            + e.getMessage(),
                    e
            );
        }
    }
}