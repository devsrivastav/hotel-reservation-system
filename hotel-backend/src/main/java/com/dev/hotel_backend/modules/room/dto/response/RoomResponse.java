package com.dev.hotel_backend.modules.room.dto.response;

import com.dev.hotel_backend.modules.room.enums.RoomStatus;
import com.dev.hotel_backend.modules.room.enums.RoomType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomResponse {

    private Long id;

    private String roomNumber;

    private RoomType roomType;

    private BigDecimal pricePerNight;

    private Integer capacity;

    private Integer floor;

    private String description;

    private RoomStatus status;

    private Long hotelId;

    private String hotelName;
}
