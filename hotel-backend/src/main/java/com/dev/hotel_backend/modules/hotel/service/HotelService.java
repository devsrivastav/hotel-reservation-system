package com.dev.hotel_backend.modules.hotel.service;



import com.dev.hotel_backend.modules.hotel.dto.request.CreateHotelRequest;
import com.dev.hotel_backend.modules.hotel.dto.request.UpdateHotelRequest;
import com.dev.hotel_backend.modules.hotel.dto.response.HotelResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface HotelService {

    HotelResponse createHotel(CreateHotelRequest request);

    HotelResponse updateHotel(Long id, UpdateHotelRequest request);

    void deleteHotel(Long id);

    HotelResponse getHotelById(Long id);

    List<HotelResponse> getAllHotels();

    List<HotelResponse> searchByCity(String city);

    List<HotelResponse> searchByName(String name);

    String uploadHotelImage(Long hotelId, MultipartFile file);
}
