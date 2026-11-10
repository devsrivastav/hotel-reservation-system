
package com.dev.hotel_backend.modules.room.controller;

import org.springframework.security.access.prepost.PreAuthorize;
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

    // ADMIN - CREATE ROOM
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @Valid @RequestBody CreateRoomRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(roomService.createRoom(request));
    }

    // PUBLIC - GET ROOM BY ID
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> getRoomById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                roomService.getRoomById(id)
        );
    }

    // PUBLIC - GET ALL ROOMS
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(
                roomService.getAllRooms()
        );
    }

    // PUBLIC - GET ROOMS BY HOTEL
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<RoomResponse>> getRoomsByHotel(
            @PathVariable Long hotelId
    ) {
        return ResponseEntity.ok(
                roomService.getRoomsByHotel(hotelId)
        );
    }

    // ADMIN - UPLOAD ROOM IMAGE
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/{roomId}/image")
    public ResponseEntity<String> uploadRoomImage(
            @PathVariable Long roomId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(
                roomService.uploadRoomImage(roomId, file)
        );
    }

    // ADMIN - UPDATE ROOM
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoomRequest request
    ) {
        return ResponseEntity.ok(
                roomService.updateRoom(id, request)
        );
    }

    // ADMIN - DELETE ROOM
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long id
    ) {
        roomService.deleteRoom(id);

        return ResponseEntity.noContent().build();
    }

    // PUBLIC - SEARCH AVAILABLE ROOMS
    @GetMapping("/search")
    public ResponseEntity<Page<RoomResponse>> searchAvailableRooms(
            @RequestParam String city,
            @RequestParam LocalDate checkIn,
            @RequestParam LocalDate checkOut,
            @RequestParam Integer guests,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 10) Pageable pageable
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
