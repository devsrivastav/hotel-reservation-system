package com.dev.hotel_backend.modules.room.controller;

import com.dev.hotel_backend.modules.room.dto.request.CreateRoomRequest;
import com.dev.hotel_backend.modules.room.dto.response.RoomResponse;
import com.dev.hotel_backend.modules.room.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    public RoomResponse createRoom(
            @Valid @RequestBody CreateRoomRequest request) {

        return roomService.createRoom(request);
    }

    @GetMapping
    public List<RoomResponse> getAllRooms() {

        return roomService.getAllRooms();
    }

    @GetMapping("/{id}")
    public RoomResponse getRoomById(@PathVariable Long id) {

        return roomService.getRoomById(id);
    }

    @GetMapping("/hotel/{hotelId}")
    public List<RoomResponse> getRoomsByHotel(
            @PathVariable Long hotelId) {

        return roomService.getRoomsByHotel(hotelId);
    }

    @DeleteMapping("/{id}")
    public String deleteRoom(@PathVariable Long id) {

        roomService.deleteRoom(id);

        return "Room deleted successfully";
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            value="/{id}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public String uploadRoomImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file){

        return roomService.uploadRoomImage(id,file);
    }

    @GetMapping("/available")
    public Page<RoomResponse> searchAvailableRooms(

            @RequestParam(required = false) String city,

            @RequestParam LocalDate checkIn,

            @RequestParam LocalDate checkOut,

            @RequestParam(required = false) Integer guests,

            @RequestParam(required = false) BigDecimal minPrice,

            @RequestParam(required = false) BigDecimal maxPrice,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size,

            @RequestParam(defaultValue = "pricePerNight") String sortBy,

            @RequestParam(defaultValue = "asc") String direction
    ) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return roomService.searchAvailableRooms(
                city,
                checkIn,
                checkOut,
                guests,
                minPrice,
                maxPrice,
                pageable
        );
    }
}
