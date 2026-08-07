package com.dev.hotel_backend.modules.room.dto.request;

import com.dev.hotel_backend.modules.room.enums.RoomType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoomRequest {

    @NotBlank
    private String roomNumber;

    @NotNull
    private RoomType roomType;

    @NotNull
    @DecimalMin("1.0")
    private BigDecimal pricePerNight;

    @NotNull
    @Min(1)
    private Integer capacity;

    private Integer floor;

    private String description;

    @NotNull
    private Long hotelId;
}
