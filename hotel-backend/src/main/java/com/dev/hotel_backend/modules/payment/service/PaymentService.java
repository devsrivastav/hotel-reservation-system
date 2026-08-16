package com.dev.hotel_backend.modules.payment.service;

import com.dev.hotel_backend.modules.payment.dto.response.PaymentResponse;

import java.util.List;

public interface PaymentService {

    PaymentResponse createOrder(
            Long bookingId
    );

    PaymentResponse verifyPayment(
            Long bookingId,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    );

    PaymentResponse refundPayment(Long paymentId);

    List<PaymentResponse> getAllPayments();
}