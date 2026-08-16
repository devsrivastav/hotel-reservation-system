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
import com.dev.hotel_backend.modules.payment.repository.PaymentRepository;
import com.dev.hotel_backend.modules.payment.enums.PaymentStatus;
import com.dev.hotel_backend.modules.room.entity.Room;
import com.dev.hotel_backend.modules.room.repository.RoomRepository;
import com.dev.hotel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final PaymentRepository paymentRepository;

    // =====================================================
    // CUSTOMER - CREATE BOOKING
    // =====================================================

    @Override
    @Transactional
    public BookingResponse createBooking(
            CreateBookingRequest request,
            String userEmail
    ) {

        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );


        // -------------------------------------------------
        // FIND ROOM
        // -------------------------------------------------

        Room room = roomRepository.findById(
                        request.getRoomId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found"
                        )
                );


        // -------------------------------------------------
        // DATE VALIDATION
        // -------------------------------------------------

        if (request.getCheckInDate() == null ||
                request.getCheckOutDate() == null) {

            throw new BadRequestException(
                    "Check-in and check-out dates are required."
            );
        }


        if (!request.getCheckOutDate()
                .isAfter(request.getCheckInDate())) {

            throw new BadRequestException(
                    "Check-out date must be after check-in date."
            );
        }


        if (request.getCheckInDate()
                .isBefore(LocalDate.now())) {

            throw new BadRequestException(
                    "Check-in date cannot be in the past."
            );
        }


        // -------------------------------------------------
        // GUEST VALIDATION
        // -------------------------------------------------

        if (request.getNumberOfGuests() == null ||
                request.getNumberOfGuests() < 1) {

            throw new BadRequestException(
                    "At least one guest is required."
            );
        }


        if (request.getNumberOfGuests()
                > room.getCapacity()) {

            throw new BadRequestException(
                    "Number of guests exceeds room capacity."
            );
        }


        // -------------------------------------------------
        // ROOM STATUS VALIDATION
        // -------------------------------------------------

        if (room.getStatus() == null) {

            throw new BadRequestException(
                    "Room status is not available."
            );
        }

        if (!room.getStatus()
                .name()
                .equals("AVAILABLE")) {

            throw new BadRequestException(
                    "Room is currently not available."
            );
        }


        // -------------------------------------------------
        // CHECK ROOM AVAILABILITY
        // -------------------------------------------------

        boolean alreadyBooked =
                bookingRepository
                        .existsByRoomIdAndStatusNotAndCheckInDateLessThanAndCheckOutDateGreaterThan(
                                room.getId(),
                                BookingStatus.CANCELLED,
                                request.getCheckOutDate(),
                                request.getCheckInDate()
                        );


        if (alreadyBooked) {

            throw new BadRequestException(
                    "Room is already booked for the selected dates."
            );
        }


        // -------------------------------------------------
        // CALCULATE NIGHTS
        // -------------------------------------------------

        long nights =
                ChronoUnit.DAYS.between(
                        request.getCheckInDate(),
                        request.getCheckOutDate()
                );


        if (nights <= 0) {

            throw new BadRequestException(
                    "Invalid booking duration."
            );
        }


        // -------------------------------------------------
        // CALCULATE TOTAL PRICE
        // -------------------------------------------------

        if (room.getPricePerNight() == null) {

            throw new BadRequestException(
                    "Room price is not configured."
            );
        }


        BigDecimal totalAmount =
                room.getPricePerNight()
                        .multiply(
                                BigDecimal.valueOf(nights)
                        );


        // -------------------------------------------------
        // CREATE BOOKING
        // -------------------------------------------------

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkInDate(
                        request.getCheckInDate()
                )
                .checkOutDate(
                        request.getCheckOutDate()
                )
                .numberOfGuests(
                        request.getNumberOfGuests()
                )
                .totalPrice(totalAmount)
                .status(
                        BookingStatus.CONFIRMED
                )
                .build();


        // -------------------------------------------------
        // SAVE BOOKING
        // -------------------------------------------------

        Booking savedBooking =
                bookingRepository.save(booking);


        // Make sure database operation is completed
        // before processing email.
        bookingRepository.flush();


        // -------------------------------------------------
        // SEND CONFIRMATION EMAIL
        // IMPORTANT:
        // Email failure must NOT make booking fail.
        // -------------------------------------------------

        try {

            emailService.sendBookingConfirmation(
                    user.getEmail(),
                    savedBooking
                            .getRoom()
                            .getHotel()
                            .getName(),
                    savedBooking
                            .getRoom()
                            .getRoomNumber(),
                    savedBooking
                            .getCheckInDate()
                            .toString(),
                    savedBooking
                            .getCheckOutDate()
                            .toString()
            );

        } catch (Exception emailException) {

            System.err.println(
                    "================================================="
            );

            System.err.println(
                    "BOOKING CREATED SUCCESSFULLY"
            );

            System.err.println(
                    "Confirmation email could not be sent."
            );

            System.err.println(
                    "Email error: "
                            + emailException.getMessage()
            );

            System.err.println(
                    "================================================="
            );
        }


        // -------------------------------------------------
        // RETURN RESPONSE
        // -------------------------------------------------

        return BookingMapper.toResponse(
                savedBooking
        );
    }


    // =====================================================
    // CUSTOMER - MY BOOKINGS
    // =====================================================

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        return bookingRepository.findByUserId(user.getId())
                .stream()
                .map(booking -> {

                    BookingResponse response =
                            BookingMapper.toResponse(booking);

                    paymentRepository
                            .findByBookingId(booking.getId())
                            .ifPresent(payment -> {

                                response.setPaymentStatus(
                                        payment.getStatus().name()
                                );

                                response.setPaymentId(
                                        payment.getId()
                                );

                                response.setRazorpayPaymentId(
                                        payment.getRazorpayPaymentId()
                                );
                            });

                    return response;
                })
                .toList();
    }


    // =====================================================
    // CUSTOMER - GET BOOKING
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(
            Long bookingId,
            String userEmail
    ) {

        Booking booking =
                bookingRepository.findById(
                                bookingId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found"
                                )
                        );


        if (!booking.getUser()
                .getEmail()
                .equals(userEmail)) {

            throw new BadRequestException(
                    "You are not allowed to access this booking."
            );
        }


        return BookingMapper.toResponse(
                booking
        );
    }


    // =====================================================
    // CUSTOMER - CANCEL BOOKING
    // =====================================================

    @Override
    @Transactional
    public void cancelBooking(
            Long bookingId,
            String userEmail
    ) {

        Booking booking =
                bookingRepository.findById(
                                bookingId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Booking not found"
                                )
                        );


        // -------------------------------------------------
        // OWNERSHIP CHECK
        // -------------------------------------------------

        if (!booking.getUser()
                .getEmail()
                .equals(userEmail)) {

            throw new BadRequestException(
                    "You are not allowed to cancel this booking."
            );
        }


        // -------------------------------------------------
        // CHECK PAYMENT STATUS
        // -------------------------------------------------

        paymentRepository
                .findByBookingId(bookingId)
                .ifPresent(payment -> {

                    if (payment.getStatus() == PaymentStatus.PAID) {

                        System.out.println(
                                "Paid booking cancellation requested. " +
                                        "Refund must be processed separately."
                        );
                    }
                });


        // -------------------------------------------------
        // ALREADY CANCELLED
        // -------------------------------------------------

        if (booking.getStatus()
                == BookingStatus.CANCELLED) {

            throw new BadRequestException(
                    "Booking is already cancelled."
            );
        }


        // -------------------------------------------------
        // CANCEL BOOKING
        // -------------------------------------------------

        booking.setStatus(
                BookingStatus.CANCELLED
        );


        Booking savedBooking =
                bookingRepository.save(
                        booking
                );


        // -------------------------------------------------
        // SEND CANCELLATION EMAIL
        // IMPORTANT:
        // Email failure must NOT make cancellation fail.
        // -------------------------------------------------

        try {

            emailService.sendBookingCancellation(
                    savedBooking
                            .getUser()
                            .getEmail(),

                    savedBooking
                            .getRoom()
                            .getHotel()
                            .getName()
            );

        } catch (Exception emailException) {

            System.err.println(
                    "================================================="
            );

            System.err.println(
                    "BOOKING CANCELLED SUCCESSFULLY"
            );

            System.err.println(
                    "Cancellation email could not be sent."
            );

            System.err.println(
                    "Email error: "
                            + emailException.getMessage()
            );

            System.err.println(
                    "================================================="
            );
        }
    }


    // =====================================================
    // ADMIN - GET ALL BOOKINGS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {

        return bookingRepository.findAll()
                .stream()
                .map(BookingMapper::toResponse)
                .toList();
    }


    // =====================================================
    // ADMIN - GET BOOKINGS BY STATUS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByStatus(
            BookingStatus status
    ) {

        return bookingRepository
                .findByStatus(status)
                .stream()
                .map(BookingMapper::toResponse)
                .toList();
    }
}