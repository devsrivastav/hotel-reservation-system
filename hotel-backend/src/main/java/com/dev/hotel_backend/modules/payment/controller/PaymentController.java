package com.dev.hotel_backend.modules.payment.controller;

import com.dev.hotel_backend.modules.payment.dto.request.CreatePaymentRequest;
import com.dev.hotel_backend.modules.payment.dto.request.VerifyPaymentRequest;
import com.dev.hotel_backend.modules.payment.dto.response.PaymentResponse;
import com.dev.hotel_backend.modules.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public PaymentResponse createOrder(
            @Valid @RequestBody CreatePaymentRequest request,
            Authentication authentication) {

        return paymentService.createPaymentOrder(
                request,
                authentication.getName());
    }

    @PostMapping("/verify")
    public PaymentResponse verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request) {

        return paymentService.verifyPayment(request);
    }

    @GetMapping("/booking/{bookingId}")
    public PaymentResponse getPaymentByBooking(
            @PathVariable Long bookingId) {

        return paymentService.getPaymentByBooking(bookingId);
    }
}