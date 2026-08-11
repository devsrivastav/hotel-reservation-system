package com.dev.hotel_backend.modules.payment.service;

import com.dev.hotel_backend.modules.payment.dto.request.CreatePaymentRequest;
import com.dev.hotel_backend.modules.payment.dto.request.VerifyPaymentRequest;
import com.dev.hotel_backend.modules.payment.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPaymentOrder(
            CreatePaymentRequest request,
            String userEmail);

    PaymentResponse verifyPayment(
            VerifyPaymentRequest request);

    PaymentResponse getPaymentByBooking(Long bookingId);
}