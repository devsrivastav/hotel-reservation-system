package com.dev.hotel_backend.modules.email.service.impl;

import com.dev.hotel_backend.modules.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendBookingConfirmation(
            String to,
            String hotelName,
            String roomNumber,
            String checkIn,
            String checkOut) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Booking Confirmed");

        message.setText(
                "Your booking has been confirmed.\n\n"
                        + "Hotel : " + hotelName + "\n"
                        + "Room : " + roomNumber + "\n"
                        + "Check-In : " + checkIn + "\n"
                        + "Check-Out : " + checkOut);

        mailSender.send(message);
    }

    @Override
    public void sendBookingCancellation(
            String to,
            String hotelName) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Booking Cancelled");

        message.setText(
                "Your booking for "
                        + hotelName
                        + " has been cancelled.");

        mailSender.send(message);
    }

    @Override
    public void sendPaymentSuccess(
            String to,
            String amount,
            String orderId) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Payment Successful");

        message.setText(
                "Payment Successful.\n\n"
                        + "Amount : ₹" + amount + "\n"
                        + "Order ID : " + orderId);

        mailSender.send(message);
    }
}