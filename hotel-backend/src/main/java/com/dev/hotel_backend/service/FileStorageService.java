
package com.dev.hotel_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final String HOTEL_FOLDER = "hotels";
    private static final String ROOM_FOLDER = "rooms";

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final Path uploadRoot = Paths.get(
            System.getProperty("user.dir"),
            "uploads"
    ).toAbsolutePath().normalize();

    public String uploadHotelImage(MultipartFile file) {
        return saveFile(file, HOTEL_FOLDER);
    }

    public String uploadRoomImage(MultipartFile file) {
        return saveFile(file, ROOM_FOLDER);
    }

    private String saveFile(MultipartFile file, String folder) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Image size must not exceed 5 MB."
            );
        }

        // Only allow internally defined folders
        if (!HOTEL_FOLDER.equals(folder) &&
                !ROOM_FOLDER.equals(folder)) {
            throw new IllegalArgumentException("Invalid upload folder.");
        }

        try {
            byte[] bytes = file.getBytes();

            // Detect actual JPEG or PNG file signature
            boolean isPng =
                    bytes.length >= 8 &&
                            bytes[0] == (byte) 0x89 &&
                            bytes[1] == 0x50 &&
                            bytes[2] == 0x4E &&
                            bytes[3] == 0x47 &&
                            bytes[4] == 0x0D &&
                            bytes[5] == 0x0A &&
                            bytes[6] == 0x1A &&
                            bytes[7] == 0x0A;

            boolean isJpeg =
                    bytes.length >= 3 &&
                            bytes[0] == (byte) 0xFF &&
                            bytes[1] == (byte) 0xD8 &&
                            bytes[2] == (byte) 0xFF;

            if (!isPng && !isJpeg) {
                throw new IllegalArgumentException(
                        "Only valid JPEG and PNG images are allowed."
                );
            }

            // Verify that the image can actually be decoded
            BufferedImage image = ImageIO.read(
                    new ByteArrayInputStream(bytes)
            );

            if (image == null ||
                    image.getWidth() <= 0 ||
                    image.getHeight() <= 0) {
                throw new IllegalArgumentException(
                        "Invalid image file."
                );
            }

            String extension = isPng ? ".png" : ".jpg";

            Path uploadPath = uploadRoot.resolve(folder).normalize();

            if (!uploadPath.startsWith(uploadRoot)) {
                throw new SecurityException("Invalid upload path.");
            }

            Files.createDirectories(uploadPath);

            String fileName = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(fileName).normalize();

            if (!filePath.startsWith(uploadPath)) {
                throw new SecurityException("Invalid file path.");
            }

            // CREATE_NEW prevents accidental overwriting
            Files.write(
                    filePath,
                    bytes,
                    StandardOpenOption.CREATE_NEW,
                    StandardOpenOption.WRITE
            );

            // Relative URL works in local and deployed environments
            return "/uploads/" + folder + "/" + fileName;

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Image upload failed.",
                    e
            );
        }
    }
}
