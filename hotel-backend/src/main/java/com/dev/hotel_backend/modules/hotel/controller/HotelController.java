package com.dev.hotel_backend.modules.hotel.controller;

import com.dev.hotel_backend.modules.hotel.dto.request.CreateHotelRequest;
import com.dev.hotel_backend.modules.hotel.dto.request.UpdateHotelRequest;
import com.dev.hotel_backend.modules.hotel.dto.response.HotelResponse;
import com.dev.hotel_backend.modules.hotel.service.HotelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public HotelResponse createHotel(
            @Valid @RequestBody CreateHotelRequest request) {

        return hotelService.createHotel(request);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(
            value="/{id}/image",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public String uploadHotelImage(
            @PathVariable Long id,
            @RequestParam("file")MultipartFile file){

        return hotelService.uploadHotelImage(id,file);
    }

    @GetMapping
    public List<HotelResponse> getAllHotels() {

        return hotelService.getAllHotels();
    }

    @GetMapping("/{id}")
    public HotelResponse getHotelById(@PathVariable Long id) {

        return hotelService.getHotelById(id);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public HotelResponse updateHotel(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHotelRequest request) {

        return hotelService.updateHotel(id, request);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public String deleteHotel(@PathVariable Long id) {

        hotelService.deleteHotel(id);

        return "Hotel Deleted Successfully";
    }

    @GetMapping("/search/city")
    public List<HotelResponse> searchByCity(
            @RequestParam String city) {

        return hotelService.searchByCity(city);
    }

    @GetMapping("/search/name")
    public List<HotelResponse> searchByName(
            @RequestParam String name) {

        return hotelService.searchByName(name);
    }
}