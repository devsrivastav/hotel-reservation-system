package com.dev.hotel_backend.modules.payment.service.impl;

import com.dev.hotel_backend.entity.User;
import com.dev.hotel_backend.exception.BadRequestException;
import com.dev.hotel_backend.exception.ResourceNotFoundException;
import com.dev.hotel_backend.modules.booking.entity.Booking;
import com.dev.hotel_backend.modules.booking.enums.BookingStatus;
import com.dev.hotel_backend.modules.booking.repository.BookingRepository;
import com.dev.hotel_backend.modules.email.service.EmailService;
import com.dev.hotel_backend.modules.payment.dto.request.CreatePaymentRequest;
import com.dev.hotel_backend.modules.payment.dto.request.VerifyPaymentRequest;
import com.dev.hotel_backend.modules.payment.dto.response.PaymentResponse;
import com.dev.hotel_backend.modules.payment.entity.Payment;
import com.dev.hotel_backend.modules.payment.enums.PaymentStatus;
import com.dev.hotel_backend.modules.payment.mapper.PaymentMapper;
import com.dev.hotel_backend.modules.payment.repository.PaymentRepository;
import com.dev.hotel_backend.modules.payment.service.PaymentService;
import com.dev.hotel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    public PaymentResponse createPaymentOrder(
            CreatePaymentRequest request,
            String userEmail) {

        // Fetch User
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        // Fetch Booking
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        // Validate Ownership
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new BadRequestException(
                    "You are not allowed to pay for this booking.");
        }

        // Booking Cancelled Check
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException(
                    "Cannot create payment for a cancelled booking.");
        }

        // Duplicate Payment Check
        paymentRepository.findByBookingId(booking.getId())
                .ifPresent(payment -> {
                    throw new BadRequestException(
                            "Payment already exists for this booking.");
                });

        // Create Payment
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .currency("INR")
                .razorpayOrderId("ORDER_" + UUID.randomUUID())
                .status(PaymentStatus.CREATED)
                .build();

        payment = paymentRepository.save(payment);

        return PaymentMapper.toResponse(payment);
    }

    @Override
    public PaymentResponse verifyPayment(
            VerifyPaymentRequest request) {

        Payment payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found"));

        // Already Paid Check
        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new BadRequestException(
                    "Payment has already been verified.");
        }

        // Update Payment
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.PAID);

        payment = paymentRepository.save(payment);

        // Update Booking Status (Optional if booking already confirmed)
        Booking booking = payment.getBooking();

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);
        }

        // Send Payment Success Email
        try {
            emailService.sendPaymentSuccess(
                    booking.getUser().getEmail(),
                    payment.getAmount().toString(),
                    payment.getRazorpayOrderId()
            );
        } catch (Exception e) {
            // Log email exception
            e.printStackTrace();
        }

        return PaymentMapper.toResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByBooking(Long bookingId) {

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found"));

        return PaymentMapper.toResponse(payment);
    }
}