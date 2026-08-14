package com.dev.hotel_backend.modules.room.mapper;

import com.dev.hotel_backend.modules.room.dto.request.CreateRoomRequest;
import com.dev.hotel_backend.modules.room.dto.response.RoomResponse;
import com.dev.hotel_backend.modules.room.entity.Room;

public class RoomMapper {

    private RoomMapper(){}

    public static RoomResponse toResponse(Room room){

        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .pricePerNight(room.getPricePerNight())
                .capacity(room.getCapacity())
                .floor(room.getFloor())
                .description(room.getDescription())
                .status(room.getStatus())
                .imageUrl(room.getImageUrl())
                .hotelId(room.getHotel().getId())
                .hotelName(room.getHotel().getName())
                .build();
    }

}