package com.dev.hotel_backend.modules.room.repository;

import com.dev.hotel_backend.modules.room.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {

    List<RoomType> findByHotelId(Long hotelId);

    List<RoomType> findByHotelIdAndActiveTrue(Long hotelId);
}