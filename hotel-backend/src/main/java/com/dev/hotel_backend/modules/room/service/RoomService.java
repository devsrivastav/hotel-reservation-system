package com.dev.hotel_backend.modules.room.service;

import com.dev.hotel_backend.modules.room.dto.request.CreateRoomRequest;
import com.dev.hotel_backend.modules.room.dto.request.UpdateRoomRequest;
import com.dev.hotel_backend.modules.room.dto.response.RoomResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface RoomService {

    RoomResponse createRoom(CreateRoomRequest request);

    RoomResponse getRoomById(Long id);

    List<RoomResponse> getAllRooms();

    List<RoomResponse> getRoomsByHotel(Long hotelId);
    String uploadRoomImage(Long roomId, MultipartFile file);
    void deleteRoom(Long id);

    Page<RoomResponse> searchAvailableRooms(
            String city,
            LocalDate checkIn,
            LocalDate checkOut,
            Integer guests,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    );
    RoomResponse updateRoom(
            Long id,
            UpdateRoomRequest request
    );
}
