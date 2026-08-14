package com.dev.hotel_backend.modules.room.controller;

import com.dev.hotel_backend.modules.room.dto.request.CreateRoomRequest;
import com.dev.hotel_backend.modules.room.dto.request.UpdateRoomRequest;
import com.dev.hotel_backend.modules.room.dto.response.RoomResponse;
import com.dev.hotel_backend.modules.room.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    // Create Room
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @Valid @RequestBody CreateRoomRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(roomService.createRoom(request));
    }


    // Get Room By ID
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                roomService.getRoomById(id)
        );
    }

    // Get All Rooms
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(
                roomService.getAllRooms()
        );
    }

    // Get Rooms By Hotel
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<RoomResponse>> getRoomsByHotel(
            @PathVariable Long hotelId
    ) {
        return ResponseEntity.ok(
                roomService.getRoomsByHotel(hotelId)
        );
    }

    // Upload Room Image
    @PostMapping("/{roomId}/image")
    public ResponseEntity<String> uploadRoomImage(
            @PathVariable Long roomId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(
                roomService.uploadRoomImage(roomId, file)
        );
    }

    @PutMapping("/{id}")
    public RoomResponse updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoomRequest request
    ) {
        return roomService.updateRoom(id, request);
    }

    // Delete Room
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long id
    ) {
        roomService.deleteRoom(id);

        return ResponseEntity.noContent().build();
    }

    // Search Available Rooms
    @GetMapping("/search")
    public ResponseEntity<Page<RoomResponse>> searchAvailableRooms(

            @RequestParam String city,

            @RequestParam
            LocalDate checkIn,

            @RequestParam
            LocalDate checkOut,

            @RequestParam
            Integer guests,

            @RequestParam(required = false)
            BigDecimal minPrice,

            @RequestParam(required = false)
            BigDecimal maxPrice,

            @PageableDefault(size = 10)
            Pageable pageable
    ) {

        return ResponseEntity.ok(
                roomService.searchAvailableRooms(
                        city,
                        checkIn,
                        checkOut,
                        guests,
                        minPrice,
                        maxPrice,
                        pageable
                )
        );
    }
}