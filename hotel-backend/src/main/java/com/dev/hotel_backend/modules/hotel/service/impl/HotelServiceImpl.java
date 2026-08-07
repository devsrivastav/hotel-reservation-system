package com.dev.hotel_backend.modules.hotel.service.impl;

import com.dev.hotel_backend.exception.ResourceNotFoundException;
import com.dev.hotel_backend.modules.hotel.dto.request.CreateHotelRequest;
import com.dev.hotel_backend.modules.hotel.dto.request.UpdateHotelRequest;
import com.dev.hotel_backend.modules.hotel.dto.response.HotelResponse;
import com.dev.hotel_backend.modules.hotel.entity.Hotel;
import com.dev.hotel_backend.modules.hotel.mapper.HotelMapper;
import com.dev.hotel_backend.modules.hotel.repository.HotelRepository;
import com.dev.hotel_backend.modules.hotel.service.HotelService;
import com.dev.hotel_backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.dev.hotel_backend.exception.ResourceNotFoundException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {
    private final FileStorageService fileStorageService;

    private final HotelRepository hotelRepository;

    @Override
    public HotelResponse createHotel(CreateHotelRequest request) {

        Hotel hotel = HotelMapper.toEntity(request);

        hotel = hotelRepository.save(hotel);

        return HotelMapper.toResponse(hotel);
    }

    @Override
    public HotelResponse updateHotel(Long id, UpdateHotelRequest request) {

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));

        hotel.setName(request.getName());
        hotel.setDescription(request.getDescription());
        hotel.setAddress(request.getAddress());
        hotel.setCity(request.getCity());
        hotel.setState(request.getState());
        hotel.setCountry(request.getCountry());
        hotel.setZipCode(request.getZipCode());
        hotel.setPhone(request.getPhone());
        hotel.setEmail(request.getEmail());
        hotel.setStarRating(request.getStarRating());
        hotel.setCheckInTime(request.getCheckInTime());
        hotel.setCheckOutTime(request.getCheckOutTime());

        hotel = hotelRepository.save(hotel);

        return HotelMapper.toResponse(hotel);
    }

    @Override
    public void deleteHotel(Long id) {

        hotelRepository.deleteById(id);
    }

    @Override
    public HotelResponse getHotelById(Long id) {

        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));

        return HotelMapper.toResponse(hotel);
    }

    @Override
    public List<HotelResponse> getAllHotels() {

        return hotelRepository.findAll()
                .stream()
                .map(HotelMapper::toResponse)
                .toList();
    }

    @Override
    public List<HotelResponse> searchByCity(String city) {

        return hotelRepository.findByCityIgnoreCase(city)
                .stream()
                .map(HotelMapper::toResponse)
                .toList();
    }

    @Override
    public List<HotelResponse> searchByName(String name) {

        return hotelRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(HotelMapper::toResponse)
                .toList();
    }
    @Override
    public String uploadHotelImage(Long hotelId, MultipartFile file) {

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hotel not found"));

        String imageUrl = fileStorageService.uploadHotelImage(file);

        hotel.setImageUrl(imageUrl);

        hotelRepository.save(hotel);

        return imageUrl;
    }
}
