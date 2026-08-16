package com.dev.hotel_backend.modules.payment.repository;

import com.dev.hotel_backend.modules.payment.entity.Payment;
import com.dev.hotel_backend.modules.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByRazorpayOrderId(
            String razorpayOrderId
    );

    Optional<Payment> findByRazorpayPaymentId(
            String razorpayPaymentId
    );

    Optional<Payment> findByBookingId(
            Long bookingId
    );

    boolean existsByRazorpayOrderId(
            String razorpayOrderId
    );

    boolean existsByRazorpayPaymentId(
            String razorpayPaymentId
    );

    long countByStatus(
            PaymentStatus status
    );
}