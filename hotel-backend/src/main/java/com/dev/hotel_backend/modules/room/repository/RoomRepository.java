package com.dev.hotel_backend.modules.room.repository;

import com.dev.hotel_backend.modules.room.entity.Room;
import com.dev.hotel_backend.modules.room.enums.RoomStatus;
import com.dev.hotel_backend.modules.room.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByHotelId(Long hotelId);

    List<Room> findByHotelIdAndStatus(
            Long hotelId,
            RoomStatus status
    );

    List<Room> findByRoomType(RoomType roomType);

    Optional<Room> findByHotelIdAndRoomNumber(
            Long hotelId,
            String roomNumber
    );

    boolean existsByHotelIdAndRoomNumber(
            Long hotelId,
            String roomNumber
    );
}