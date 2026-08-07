package com.dev.hotel_backend.modules.room.service.impl;

import com.dev.hotel_backend.exception.ResourceNotFoundException;
import com.dev.hotel_backend.modules.hotel.entity.Hotel;
import com.dev.hotel_backend.modules.hotel.repository.HotelRepository;
import com.dev.hotel_backend.modules.room.dto.request.CreateRoomRequest;
import com.dev.hotel_backend.modules.room.dto.response.RoomResponse;
import com.dev.hotel_backend.modules.room.entity.Room;
import com.dev.hotel_backend.modules.room.mapper.RoomMapper;
import com.dev.hotel_backend.modules.room.repository.RoomRepository;
import com.dev.hotel_backend.modules.room.service.RoomService;
import com.dev.hotel_backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final FileStorageService fileStorageService;
    @Override
    public RoomResponse createRoom(CreateRoomRequest request) {

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        Room room = Room.builder().roomNumber(request.getRoomNumber())
                .roomType(request.getRoomType())
                .pricePerNight(request.getPricePerNight())
                .capacity(request.getCapacity())
                .floor(request.getFloor())
                .description(request.getDescription())
                .hotel(hotel)
                .build();
        room = roomRepository.save(room);

        return RoomMapper.toResponse(room);
    }

    @Override
    public RoomResponse getRoomById(Long id) {

        Room room = roomRepository.findById(id).orElseThrow(() -> new RuntimeException("Room not found"));

        return RoomMapper.toResponse(room);
    }

    @Override
    public List<RoomResponse> getAllRooms() {

        return roomRepository.findAll()
                .stream()
                .map(RoomMapper::toResponse)
                .toList();
    }

    @Override
    public List<RoomResponse> getRoomsByHotel(Long hotelId) {

        return roomRepository.findByHotelId(hotelId)
                .stream()
                .map(RoomMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteRoom(Long id) {

        roomRepository.deleteById(id);
    }
    @Override
    public String uploadRoomImage(Long roomId, MultipartFile file) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Room not found"));

        String imageUrl = fileStorageService.uploadRoomImage(file);

        room.setImageUrl(imageUrl);

        roomRepository.save(room);

        return imageUrl;
    }

}
