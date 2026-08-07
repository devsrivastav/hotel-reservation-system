package com.dev.hotel_backend.modules.room.service;

import com.dev.hotel_backend.modules.room.dto.request.CreateRoomRequest;
import com.dev.hotel_backend.modules.room.dto.response.RoomResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RoomService {

    RoomResponse createRoom(CreateRoomRequest request);

    RoomResponse getRoomById(Long id);

    List<RoomResponse> getAllRooms();

    List<RoomResponse> getRoomsByHotel(Long hotelId);
    String uploadRoomImage(Long roomId, MultipartFile file);
    void deleteRoom(Long id);
}
