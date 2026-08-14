package com.dev.hotel_backend.modules.room.service.impl;

import com.dev.hotel_backend.exception.ResourceNotFoundException;
import com.dev.hotel_backend.modules.booking.enums.BookingStatus;
import com.dev.hotel_backend.modules.booking.repository.BookingRepository;
import com.dev.hotel_backend.modules.hotel.entity.Hotel;
import com.dev.hotel_backend.modules.hotel.repository.HotelRepository;
import com.dev.hotel_backend.modules.room.dto.request.CreateRoomRequest;
import com.dev.hotel_backend.modules.room.dto.request.UpdateRoomRequest;
import com.dev.hotel_backend.modules.room.dto.response.RoomResponse;
import com.dev.hotel_backend.modules.room.entity.Room;
import com.dev.hotel_backend.modules.room.enums.RoomStatus;
import com.dev.hotel_backend.modules.room.mapper.RoomMapper;
import com.dev.hotel_backend.modules.room.repository.RoomRepository;
import com.dev.hotel_backend.modules.room.service.RoomService;
import com.dev.hotel_backend.modules.room.specification.RoomSpecification;
import com.dev.hotel_backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final FileStorageService fileStorageService;
    private final BookingRepository bookingRepository;

    // =====================================================
    // CREATE ROOM
    // =====================================================

    @Override
    public RoomResponse createRoom(
            CreateRoomRequest request
    ) {

        Hotel hotel = hotelRepository.findById(
                request.getHotelId()
        ).orElseThrow(() ->
                new ResourceNotFoundException(
                        "Hotel not found"
                )
        );

        Room room = Room.builder()
                .roomNumber(request.getRoomNumber())
                .roomType(request.getRoomType())
                .pricePerNight(
                        request.getPricePerNight()
                )
                .capacity(request.getCapacity())
                .floor(request.getFloor())
                .description(request.getDescription())
                .status(
                        request.getStatus() != null
                                ? request.getStatus()
                                : RoomStatus.AVAILABLE
                )
                .hotel(hotel)
                .build();

        room = roomRepository.save(room);

        return RoomMapper.toResponse(room);
    }

    // =====================================================
    // UPDATE ROOM
    // =====================================================

    @Override
    public RoomResponse updateRoom(
            Long id,
            UpdateRoomRequest request
    ) {

        Room room = roomRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found"
                        )
                );

        room.setRoomNumber(
                request.getRoomNumber()
        );

        room.setRoomType(
                request.getRoomType()
        );

        room.setPricePerNight(
                request.getPricePerNight()
        );

        room.setCapacity(
                request.getCapacity()
        );

        room.setFloor(
                request.getFloor()
        );

        room.setDescription(
                request.getDescription()
        );

        if (request.getStatus() != null) {
            room.setStatus(
                    request.getStatus()
            );
        }

        Room updatedRoom =
                roomRepository.save(room);

        return RoomMapper.toResponse(
                updatedRoom
        );
    }

    // =====================================================
    // GET ROOM BY ID
    // =====================================================

    @Override
    public RoomResponse getRoomById(
            Long id
    ) {

        Room room = roomRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found"
                        )
                );

        return RoomMapper.toResponse(room);
    }

    // =====================================================
    // GET ALL ROOMS
    // =====================================================

    @Override
    public List<RoomResponse> getAllRooms() {

        return roomRepository.findAll()
                .stream()
                .map(RoomMapper::toResponse)
                .toList();
    }

    // =====================================================
    // GET ROOMS BY HOTEL
    // =====================================================

    @Override
    public List<RoomResponse> getRoomsByHotel(
            Long hotelId
    ) {

        // Verify hotel exists
        hotelRepository.findById(hotelId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Hotel not found"
                        )
                );

        return roomRepository
                .findByHotelId(hotelId)
                .stream()
                .map(RoomMapper::toResponse)
                .toList();
    }

    // =====================================================
    // DELETE ROOM
    // =====================================================

    @Override
    public void deleteRoom(
            Long id
    ) {

        Room room = roomRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found"
                        )
                );

        roomRepository.delete(room);
    }

    // =====================================================
    // UPLOAD ROOM IMAGE
    // =====================================================

    @Override
    public String uploadRoomImage(
            Long roomId,
            MultipartFile file
    ) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found"
                        )
                );

        String imageUrl =
                fileStorageService.uploadRoomImage(
                        file
                );

        room.setImageUrl(imageUrl);

        roomRepository.save(room);

        return imageUrl;
    }

    // =====================================================
    // SEARCH AVAILABLE ROOMS
    // =====================================================

    @Override
    public Page<RoomResponse> searchAvailableRooms(
            String city,
            LocalDate checkIn,
            LocalDate checkOut,
            Integer guests,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Pageable pageable
    ) {

        Specification<Room> specification =
                Specification
                        .where(
                                RoomSpecification.hasCity(
                                        city
                                )
                        )
                        .and(
                                RoomSpecification.hasStatus(
                                        RoomStatus.AVAILABLE
                                )
                        )
                        .and(
                                RoomSpecification.hasCapacity(
                                        guests
                                )
                        )
                        .and(
                                RoomSpecification.minPrice(
                                        minPrice
                                )
                        )
                        .and(
                                RoomSpecification.maxPrice(
                                        maxPrice
                                )
                        );

        Page<Room> roomPage =
                roomRepository.findAll(
                        specification,
                        pageable
                );

        List<RoomResponse> availableRooms =
                new ArrayList<>();

        for (Room room :
                roomPage.getContent()) {

            // Dates not provided
            if (
                    checkIn == null ||
                            checkOut == null
            ) {

                availableRooms.add(
                        RoomMapper.toResponse(room)
                );

                continue;
            }

            boolean booked =
                    bookingRepository
                            .existsByRoomIdAndStatusNotAndCheckInDateLessThanAndCheckOutDateGreaterThan(
                                    room.getId(),
                                    BookingStatus.CANCELLED,
                                    checkOut,
                                    checkIn
                            );

            if (!booked) {

                availableRooms.add(
                        RoomMapper.toResponse(room)
                );
            }
        }

        return new PageImpl<>(
                availableRooms,
                pageable,
                availableRooms.size()
        );
    }
}