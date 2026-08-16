package com.dev.hotel_backend.modules.payment.controller;

import com.dev.hotel_backend.modules.payment.dto.request.CreatePaymentRequest;
import com.dev.hotel_backend.modules.payment.dto.request.VerifyPaymentRequest;
import com.dev.hotel_backend.modules.payment.dto.response.PaymentResponse;
import com.dev.hotel_backend.modules.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // =====================================================
    // ADMIN - GET ALL PAYMENTS
    // =====================================================

    @PreAuthorize("hasRole('ADMIN', 'SUPER_ADMIN')")
    @GetMapping
    public List<PaymentResponse> getAllPayments() {

        return paymentService.getAllPayments();
    }

    // =====================================================
    // CUSTOMER - CREATE PAYMENT ORDER
    // =====================================================

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/create-order")
    public PaymentResponse createPaymentOrder(
            @Valid @RequestBody CreatePaymentRequest request
    ) {

        return paymentService.createOrder(
                request.getBookingId()
        );
    }

    // =====================================================
    // CUSTOMER - VERIFY PAYMENT
    // =====================================================

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/verify")
    public PaymentResponse verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request,
            @RequestParam Long bookingId
    ) {

        return paymentService.verifyPayment(
                bookingId,
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );
    }

    // =====================================================
    // ADMIN - REFUND PAYMENT
    // =====================================================

    @PreAuthorize("hasRole('ADMIN', 'SUPER_ADMIN')")
    @PostMapping("/{paymentId}/refund")
    public PaymentResponse refundPayment(
            @PathVariable Long paymentId
    ) {

        return paymentService.refundPayment(
                paymentId
        );
    }
}