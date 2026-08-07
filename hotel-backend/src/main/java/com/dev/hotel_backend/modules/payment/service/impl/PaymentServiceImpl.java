package com.dev.hotel_backend.modules.payment.service.impl;

import com.dev.hotel_backend.exception.ResourceNotFoundException;
import com.dev.hotel_backend.modules.booking.entity.Booking;
import com.dev.hotel_backend.modules.booking.repository.BookingRepository;
import com.dev.hotel_backend.modules.payment.dto.request.CreateOrderRequest;
import com.dev.hotel_backend.modules.payment.dto.response.CreateOrderResponse;
import com.dev.hotel_backend.modules.payment.entity.Payment;
import com.dev.hotel_backend.modules.payment.enums.PaymentStatus;
import com.dev.hotel_backend.modules.payment.repository.PaymentRepository;
import com.dev.hotel_backend.modules.payment.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Override
    public CreateOrderResponse createOrder(CreateOrderRequest request) throws Exception {

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with id: " + request.getBookingId()));

        JSONObject options = new JSONObject();

        // Razorpay amount paisa me hota hai
        options.put("amount",
                booking.getTotalPrice()
                        .multiply(BigDecimal.valueOf(100))
                        .intValue());

        options.put("currency", "INR");
        options.put("receipt", "booking_" + booking.getId());

        Order order = razorpayClient.orders.create(options);

        Payment payment = Payment.builder()
                .booking(booking)
                .orderId(order.get("id").toString())
                .amount(booking.getTotalPrice())
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);

        return CreateOrderResponse.builder()
                .orderId(order.get("id").toString())
                .amount(booking.getTotalPrice())
                .currency("INR")
                .key(keyId)
                .build();
    }
}