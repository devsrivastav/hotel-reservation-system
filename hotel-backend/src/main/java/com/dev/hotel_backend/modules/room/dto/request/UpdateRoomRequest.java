package com.dev.hotel_backend.modules.room.dto.request;

import com.dev.hotel_backend.modules.room.enums.RoomStatus;
import com.dev.hotel_backend.modules.room.enums.RoomType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRoomRequest {

    @Size(max = 20, message = "Room number must not exceed 20 characters")
    private String roomNumber;

    private RoomType roomType;

    @Positive(message = "Price must be greater than zero")
    private BigDecimal pricePerNight;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Min(value = 0, message = "Floor cannot be negative")
    private Integer floor;

    private String description;

    private RoomStatus status;
}