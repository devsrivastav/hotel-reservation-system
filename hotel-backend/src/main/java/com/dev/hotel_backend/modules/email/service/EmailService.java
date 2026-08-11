package com.dev.hotel_backend.modules.email.service;

public interface EmailService {

    void sendBookingConfirmation(
            String to,
            String hotelName,
            String roomNumber,
            String checkIn,
            String checkOut);

    void sendBookingCancellation(
            String to,
            String hotelName);

    void sendPaymentSuccess(
            String to,
            String amount,
            String orderId);
}