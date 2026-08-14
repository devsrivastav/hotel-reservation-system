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
import com.dev.hotel_backend.modules.email.service.EmailService;
import com.dev.hotel_backend.modules.room.entity.Room;
import com.dev.hotel_backend.modules.room.repository.RoomRepository;
import com.dev.hotel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // =========================================================
    // CREATE BOOKING
    // =========================================================
    @Override
    public BookingResponse createBooking(
            CreateBookingRequest request,
            String userEmail
    ) {

        // -----------------------------------------------------
        // 1. Validate request
        // -----------------------------------------------------
        if (request == null) {
            throw new BadRequestException("Booking request cannot be null.");
        }

        if (request.getRoomId() == null) {
            throw new BadRequestException("Room ID is required.");
        }

        if (request.getCheckInDate() == null) {
            throw new BadRequestException("Check-in date is required.");
        }

        if (request.getCheckOutDate() == null) {
            throw new BadRequestException("Check-out date is required.");
        }

        if (request.getNumberOfGuests() == null) {
            throw new BadRequestException("Number of guests is required.");
        }

        if (request.getNumberOfGuests() <= 0) {
            throw new BadRequestException(
                    "Number of guests must be greater than zero."
            );
        }

        // -----------------------------------------------------
        // 2. Validate dates
        // -----------------------------------------------------
        LocalDate checkInDate = request.getCheckInDate();
        LocalDate checkOutDate = request.getCheckOutDate();

        if (checkInDate.isBefore(LocalDate.now())) {
            throw new BadRequestException(
                    "Check-in date cannot be in the past."
            );
        }

        if (!checkOutDate.isAfter(checkInDate)) {
            throw new BadRequestException(
                    "Check-out date must be after check-in date."
            );
        }

        // -----------------------------------------------------
        // 3. Fetch user
        // -----------------------------------------------------
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        // -----------------------------------------------------
        // 4. Fetch room
        // -----------------------------------------------------
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Room not found")
                );

        // -----------------------------------------------------
        // 5. Validate guest capacity
        // -----------------------------------------------------
        if (request.getNumberOfGuests() > room.getCapacity()) {
            throw new BadRequestException(
                    "Number of guests exceeds room capacity."
            );
        }

        // -----------------------------------------------------
        // 6. Check room availability
        //
        // Existing booking is considered blocking unless
        // its status is CANCELLED.
        // -----------------------------------------------------
        boolean alreadyBooked = bookingRepository
                .existsByRoomIdAndStatusNotAndCheckInDateLessThanAndCheckOutDateGreaterThan(
                        room.getId(),
                        BookingStatus.CANCELLED,
                        checkOutDate,
                        checkInDate
                );

        if (alreadyBooked) {
            throw new BadRequestException(
                    "Room is already booked for the selected dates."
            );
        }

        // -----------------------------------------------------
        // 7. Calculate number of nights
        // -----------------------------------------------------
        long nights = ChronoUnit.DAYS.between(
                checkInDate,
                checkOutDate
        );

        if (nights <= 0) {
            throw new BadRequestException(
                    "Booking must be for at least one night."
            );
        }

        // -----------------------------------------------------
        // 8. Calculate total price
        // -----------------------------------------------------
        BigDecimal pricePerNight = room.getPricePerNight();

        if (pricePerNight == null) {
            throw new BadRequestException(
                    "Room price is not configured."
            );
        }

        BigDecimal totalAmount = pricePerNight.multiply(
                BigDecimal.valueOf(nights)
        );

        // -----------------------------------------------------
        // 9. Create booking
        // -----------------------------------------------------
        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkInDate(checkInDate)
                .checkOutDate(checkOutDate)
                .numberOfGuests(request.getNumberOfGuests())
                .totalPrice(totalAmount)
                .status(BookingStatus.CONFIRMED)
                .build();

        // -----------------------------------------------------
        // 10. Save booking
        // -----------------------------------------------------
        Booking savedBooking = bookingRepository.save(booking);

        // -----------------------------------------------------
        // 11. Send confirmation email
        //
        // IMPORTANT:
        // Email failure should NOT cancel/fail the booking.
        // -----------------------------------------------------
        try {

            emailService.sendBookingConfirmation(
                    user.getEmail(),
                    savedBooking.getRoom().getHotel().getName(),
                    savedBooking.getRoom().getRoomNumber(),
                    savedBooking.getCheckInDate().toString(),
                    savedBooking.getCheckOutDate().toString()
            );

        } catch (Exception e) {

            // Booking is already successfully saved.
            // Email failure should not affect booking.
            System.err.println(
                    "Booking created successfully, but confirmation email failed: "
                            + e.getMessage()
            );
        }

        // -----------------------------------------------------
        // 12. Return response
        // -----------------------------------------------------
        return BookingMapper.toResponse(savedBooking);
    }

    // =========================================================
    // GET MY BOOKINGS
    // =========================================================
    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        return bookingRepository.findByUserId(user.getId())
                .stream()
                .map(BookingMapper::toResponse)
                .toList();
    }

    // =========================================================
    // GET BOOKING BY ID
    // =========================================================
    @Override
    public BookingResponse getBookingById(
            Long bookingId,
            String userEmail
    ) {

        if (bookingId == null) {
            throw new BadRequestException(
                    "Booking ID is required."
            );
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found")
                );

        // Make sure user can access only their own booking
        if (booking.getUser() == null
                || booking.getUser().getEmail() == null
                || !booking.getUser().getEmail().equals(userEmail)) {

            throw new BadRequestException(
                    "You are not allowed to access this booking."
            );
        }

        return BookingMapper.toResponse(booking);
    }

    // =========================================================
    // CANCEL BOOKING
    // =========================================================
    @Override
    public void cancelBooking(
            Long bookingId,
            String userEmail
    ) {

        if (bookingId == null) {
            throw new BadRequestException(
                    "Booking ID is required."
            );
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found")
                );

        // -----------------------------------------------------
        // Check ownership
        // -----------------------------------------------------
        if (booking.getUser() == null
                || booking.getUser().getEmail() == null
                || !booking.getUser().getEmail().equals(userEmail)) {

            throw new BadRequestException(
                    "You are not allowed to cancel this booking."
            );
        }

        // -----------------------------------------------------
        // Prevent cancelling an already cancelled booking
        // -----------------------------------------------------
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException(
                    "Booking is already cancelled."
            );
        }

        // -----------------------------------------------------
        // Update booking status
        // -----------------------------------------------------
        booking.setStatus(BookingStatus.CANCELLED);

        Booking cancelledBooking = bookingRepository.save(booking);

        // -----------------------------------------------------
        // Send cancellation email
        //
        // Email failure should NOT undo cancellation.
        // -----------------------------------------------------
        try {

            emailService.sendBookingCancellation(
                    cancelledBooking.getUser().getEmail(),
                    cancelledBooking.getRoom().getHotel().getName()
            );

        } catch (Exception e) {

            System.err.println(
                    "Booking cancelled successfully, but cancellation email failed: "
                            + e.getMessage()
            );
        }
    }
}