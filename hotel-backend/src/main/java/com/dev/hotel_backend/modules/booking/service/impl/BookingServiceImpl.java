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
import com.dev.hotel_backend.modules.payment.enums.PaymentStatus;
import com.dev.hotel_backend.modules.payment.repository.PaymentRepository;
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

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Room not found")
                );

        if (request.getCheckInDate() == null
                || request.getCheckOutDate() == null) {
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

        if (request.getCheckInDate().isBefore(LocalDate.now())) {
            throw new BadRequestException(
                    "Check-in date cannot be in the past."
            );
        }

        if (request.getNumberOfGuests() == null
                || request.getNumberOfGuests() < 1) {
            throw new BadRequestException(
                    "At least one guest is required."
            );
        }

        if (request.getNumberOfGuests() > room.getCapacity()) {
            throw new BadRequestException(
                    "Number of guests exceeds room capacity."
            );
        }

        if (room.getStatus() == null
                || !room.getStatus().name().equals("AVAILABLE")) {
            throw new BadRequestException(
                    "Room is currently not available."
            );
        }

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

        long nights = ChronoUnit.DAYS.between(
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        if (nights <= 0) {
            throw new BadRequestException(
                    "Invalid booking duration."
            );
        }

        if (room.getPricePerNight() == null) {
            throw new BadRequestException(
                    "Room price is not configured."
            );
        }

        BigDecimal totalAmount = room.getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        // Booking remains PENDING until admin approval.
        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .numberOfGuests(request.getNumberOfGuests())
                .totalPrice(totalAmount)
                .status(BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        return toResponseWithPayment(savedBooking);
    }

    // =====================================================
    // CUSTOMER - MY BOOKINGS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        return bookingRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponseWithPayment)
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

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found")
                );

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException(
                    "You are not allowed to access this booking."
            );
        }

        return toResponseWithPayment(booking);
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

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found")
                );

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException(
                    "You are not allowed to cancel this booking."
            );
        }

        ensureCanCancel(booking);

        booking.setStatus(BookingStatus.CANCELLED);

        Booking savedBooking = bookingRepository.save(booking);

        sendCancellationEmailSafely(savedBooking);
    }

    // =====================================================
    // ADMIN - CONFIRM BOOKING
    // =====================================================

    @Override
    @Transactional
    public void confirmBookingByAdmin(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found")
                );

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException(
                    "Only pending bookings can be confirmed."
            );
        }

        boolean paymentIsPaid = paymentRepository
                .findByBookingId(bookingId)
                .map(payment -> payment.getStatus() == PaymentStatus.PAID)
                .orElse(false);

        if (!paymentIsPaid) {
            throw new BadRequestException(
                    "Cannot confirm booking. Payment is not completed."
            );
        }

        booking.setStatus(BookingStatus.CONFIRMED);

        Booking savedBooking = bookingRepository.save(booking);
        // Send confirmation email after admin approval.
        sendBookingConfirmationEmailSafely(savedBooking);
    }

    // =====================================================
    // ADMIN - CANCEL BOOKING
    // =====================================================

    @Override
    @Transactional
    public void cancelBookingByAdmin(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found")
                );

        ensureCanCancel(booking);

        booking.setStatus(BookingStatus.CANCELLED);

        Booking savedBooking = bookingRepository.save(booking);

        sendCancellationEmailSafely(savedBooking);
    }

    // =====================================================
    // SHARED - VALIDATE CANCELLATION
    // =====================================================

    private void ensureCanCancel(Booking booking) {

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException(
                    "Booking is already cancelled."
            );
        }

        boolean paymentIsPaid = paymentRepository
                .findByBookingId(booking.getId())
                .map(payment -> payment.getStatus() == PaymentStatus.PAID)
                .orElse(false);

        if (paymentIsPaid) {
            throw new BadRequestException(
                    "This booking has a paid payment. Process the refund first, then cancel the booking."
            );
        }
    }

    // =====================================================
    // SHARED - SEND CANCELLATION EMAIL
    // =====================================================

    private void sendCancellationEmailSafely(Booking booking) {

        try {
            emailService.sendBookingCancellation(
                    booking.getUser().getEmail(),
                    booking.getRoom().getHotel().getName()
            );

        } catch (Exception emailException) {

            System.err.println(
                    "Booking " + booking.getId()
                            + " was cancelled, but the cancellation email failed: "
                            + emailException.getMessage()
            );
        }
    }

    //Send Confirmation Email;
    private void sendBookingConfirmationEmailSafely(Booking booking) {
        try {
            emailService.sendBookingConfirmation(
                    booking.getUser().getEmail(),
                    booking.getRoom().getHotel().getName(),
                    booking.getRoom().getRoomNumber(),
                    booking.getCheckInDate().toString(),
                    booking.getCheckOutDate().toString()
            );

        } catch (Exception emailException) {
            System.err.println(
                    "Booking " + booking.getId()
                            + " was confirmed, but confirmation email failed: "
                            + emailException.getMessage()
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
                .map(this::toResponseWithPayment)
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

        return bookingRepository.findByStatus(status)
                .stream()
                .map(this::toResponseWithPayment)
                .toList();
    }

    // =====================================================
    // SHARED - MAP BOOKING AND PAYMENT DETAILS
    // =====================================================

    private BookingResponse toResponseWithPayment(Booking booking) {

        BookingResponse response = BookingMapper.toResponse(booking);

        paymentRepository.findByBookingId(booking.getId())
                .ifPresent(payment -> {

                    response.setPaymentStatus(payment.getStatus().name());
                    response.setPaymentId(payment.getId());

                    response.setRazorpayPaymentId(
                            payment.getRazorpayPaymentId()
                    );
                });

        return response;
    }
}