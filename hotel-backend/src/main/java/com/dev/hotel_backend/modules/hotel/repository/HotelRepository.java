package com.dev.hotel_backend.modules.hotel.repository;

import com.dev.hotel_backend.modules.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, Long> {

    List<Hotel> findByCityIgnoreCase(String city);

    List<Hotel> findByNameContainingIgnoreCase(String name);
}
