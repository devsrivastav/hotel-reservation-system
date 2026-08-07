package com.dev.hotel_backend.modules.booking.service.impl;

import com.dev.hotel_backend.entity.User;
import com.dev.hotel_backend.exception.BadRequestException;
import com.dev.hotel_backend.exception.ResourceNotFoundException;
import com.dev.hotel_backend.modules.booking.dto.request.CreateBookingRequest;
import com.dev.hotel_backend.modules.booking.dto.response.BookingResponse;
import com.dev.hotel_backend.modules.booking.entity.Booking;
import com.dev.hotel_backend.modules.booking.enums.BookingStatus;
import com.dev.hotel_backend.modules.booking.mapper.BookingMapper;
import com.dev.hotel_backend.modules.booking.repository.BookingRepository;
import com.dev.hotel_backend.modules.booking.service.BookingService;
import com.dev.hotel_backend.modules.room.entity.Room;
import com.dev.hotel_backend.modules.room.repository.RoomRepository;
import com.dev.hotel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Override
    public BookingResponse createBooking(CreateBookingRequest request, String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Room not found"));

        // Date Validation
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new BadRequestException(
                    "Check-out date must be after check-in date.");
        }

        // Guest Capacity Validation
        if (request.getNumberOfGuests() > room.getCapacity()) {
            throw new BadRequestException(
                    "Number of guests exceeds room capacity.");
        }

        // Room Availability Validation
        boolean alreadyBooked = bookingRepository
                .existsByRoomIdAndStatusNotAndCheckInDateLessThanAndCheckOutDateGreaterThan(
                        room.getId(),
                        BookingStatus.CANCELLED,
                        request.getCheckOutDate(),
                        request.getCheckInDate()
                );

        if (alreadyBooked) {
            throw new BadRequestException(
                    "Room is already booked for the selected dates.");
        }

        long nights = ChronoUnit.DAYS.between(
                request.getCheckInDate(),
                request.getCheckOutDate());

        if (nights <= 0) {
            throw new BadRequestException(
                    "Invalid check-in/check-out date.");
        }

        BigDecimal totalPrice = room.getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .numberOfGuests(request.getNumberOfGuests())
                .totalPrice(totalPrice)
                .status(BookingStatus.CONFIRMED)
                .build();

        bookingRepository.save(booking);

        return BookingMapper.toResponse(booking);
    }

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return bookingRepository.findByUserId(user.getId())
                .stream()
                .map(BookingMapper::toResponse)
                .toList();
    }

    @Override
    public BookingResponse getBookingById(Long bookingId, String userEmail) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException(
                    "You are not allowed to access this booking.");
        }

        return BookingMapper.toResponse(booking);
    }

    @Override
    public void cancelBooking(Long bookingId, String userEmail) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException(
                    "You are not allowed to cancel this booking.");
        }

        booking.setStatus(BookingStatus.CANCELLED);

        bookingRepository.save(booking);
    }
}