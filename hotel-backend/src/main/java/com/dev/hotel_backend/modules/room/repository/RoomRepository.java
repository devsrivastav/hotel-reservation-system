package com.dev.hotel_backend.modules.room.repository;

import com.dev.hotel_backend.modules.room.entity.Room;
import com.dev.hotel_backend.modules.room.enums.RoomStatus;
import com.dev.hotel_backend.modules.room.enums.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long>,
        JpaSpecificationExecutor<Room> {

    List<Room> findByHotelId(Long hotelId);

    List<Room> findByStatus(RoomStatus status);

    List<Room> findByRoomType(RoomType roomType);

    List<Room> findByHotelIdAndStatus(Long hotelId, RoomStatus status);
}