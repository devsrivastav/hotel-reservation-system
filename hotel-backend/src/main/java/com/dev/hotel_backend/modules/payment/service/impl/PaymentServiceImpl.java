package com.dev.hotel_backend.modules.payment.service.impl;
import com.dev.hotel_backend.modules.email.service.EmailService;
import com.dev.hotel_backend.exception.BadRequestException;
import com.dev.hotel_backend.exception.ResourceNotFoundException;
import com.dev.hotel_backend.modules.booking.entity.Booking;
import com.dev.hotel_backend.modules.booking.repository.BookingRepository;
import com.dev.hotel_backend.modules.payment.dto.response.PaymentResponse;
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
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final EmailService emailService;
    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;


    // =====================================================
    // CUSTOMER - CREATE RAZORPAY ORDER
    // =====================================================

    @Override
    @Transactional
    public PaymentResponse createOrder(Long bookingId) {

        if (bookingId == null) {
            throw new BadRequestException(
                    "Booking ID is required."
            );
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Booking not found with id: " + bookingId
                        )
                );

        // -------------------------------------------------
        // CHECK EXISTING PAYMENT
        // -------------------------------------------------

        Payment existingPayment =
                paymentRepository
                        .findByBookingId(bookingId)
                        .orElse(null);

        if (existingPayment != null) {

            if (existingPayment.getStatus()
                    == PaymentStatus.PAID) {

                throw new BadRequestException(
                        "Payment for this booking is already completed."
                );
            }

            // Existing Razorpay order
            if (existingPayment.getRazorpayOrderId() != null) {

                return toResponse(
                        existingPayment
                );
            }
        }

        // -------------------------------------------------
        // BOOKING AMOUNT
        // -------------------------------------------------

        BigDecimal amount =
                booking.getTotalPrice();

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new BadRequestException(
                    "Invalid booking amount."
            );
        }

        try {

            // Razorpay amount = paise
            long amountInPaise =
                    amount
                            .multiply(
                                    BigDecimal.valueOf(100)
                            )
                            .longValueExact();

            // -------------------------------------------------
            // CREATE RAZORPAY ORDER
            // -------------------------------------------------

            JSONObject options =
                    new JSONObject();

            options.put(
                    "amount",
                    amountInPaise
            );

            options.put(
                    "currency",
                    "INR"
            );

            options.put(
                    "receipt",
                    "booking_" +
                            booking.getId()
            );

            Order razorpayOrder =
                    razorpayClient.orders.create(
                            options
                    );

            String razorpayOrderId =
                    razorpayOrder.get("id");

            // -------------------------------------------------
            // SAVE PAYMENT
            // -------------------------------------------------

            Payment payment =
                    Payment.builder()
                            .booking(booking)
                            .razorpayOrderId(
                                    razorpayOrderId
                            )
                            .amount(amount)
                            .currency("INR")
                            .status(
                                    PaymentStatus.CREATED
                            )
                            .createdAt(
                                    LocalDateTime.now()
                            )
                            .build();

            Payment savedPayment =
                    paymentRepository.save(payment);

// Send payment receipt only after successful payment verification.
            try {
                emailService.sendPaymentSuccess(
                        payment.getBooking().getUser().getEmail(),
                        payment.getAmount().toPlainString(),
                        payment.getRazorpayOrderId()
                );

            } catch (Exception emailException) {
                System.err.println(
                        "Payment succeeded, but payment email failed: "
                                + emailException.getMessage()
                );
            }

            return toResponse(savedPayment);

        } catch (BadRequestException e) {

            throw e;

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Unable to create Razorpay order: "
                            + e.getMessage(),
                    e
            );
        }
    }


    // =====================================================
    // CUSTOMER - VERIFY RAZORPAY PAYMENT
    // =====================================================

    @Override
    @Transactional
    public PaymentResponse verifyPayment(
            Long bookingId,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {

        if (bookingId == null) {

            throw new BadRequestException(
                    "Booking ID is required."
            );
        }

        if (razorpayOrderId == null ||
                razorpayOrderId.isBlank()) {

            throw new BadRequestException(
                    "Razorpay order ID is required."
            );
        }

        if (razorpayPaymentId == null ||
                razorpayPaymentId.isBlank()) {

            throw new BadRequestException(
                    "Razorpay payment ID is required."
            );
        }

        if (razorpaySignature == null ||
                razorpaySignature.isBlank()) {

            throw new BadRequestException(
                    "Razorpay signature is required."
            );
        }

        // -------------------------------------------------
        // FIND PAYMENT
        // -------------------------------------------------

        Payment payment =
                paymentRepository
                        .findByRazorpayOrderId(
                                razorpayOrderId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment order not found."
                                )
                        );

        // -------------------------------------------------
        // VERIFY BOOKING
        // -------------------------------------------------

        if (payment.getBooking() == null ||
                !payment.getBooking()
                        .getId()
                        .equals(bookingId)) {

            throw new BadRequestException(
                    "Payment does not belong to this booking."
            );
        }

        // -------------------------------------------------
        // ALREADY PAID
        // -------------------------------------------------

        if (payment.getStatus()
                == PaymentStatus.PAID) {

            return toResponse(
                    payment
            );
        }

        // -------------------------------------------------
        // VERIFY SIGNATURE
        // -------------------------------------------------

        boolean validSignature =
                verifySignature(
                        razorpayOrderId,
                        razorpayPaymentId,
                        razorpaySignature
                );

        if (!validSignature) {

            payment.setStatus(
                    PaymentStatus.FAILED
            );

            paymentRepository.save(
                    payment
            );

            throw new BadRequestException(
                    "Invalid Razorpay payment signature."
            );
        }

        // -------------------------------------------------
        // PAYMENT SUCCESSFUL
        // -------------------------------------------------

        payment.setRazorpayPaymentId(
                razorpayPaymentId
        );

        payment.setRazorpaySignature(
                razorpaySignature
        );

        payment.setStatus(
                PaymentStatus.PAID
        );

        payment.setPaidAt(
                LocalDateTime.now()
        );

        Payment savedPayment =
                paymentRepository.save(
                        payment
                );

        return toResponse(
                savedPayment
        );
    }


    // =====================================================
    // ADMIN - REFUND PAYMENT
    // =====================================================

    @Override
    @Transactional
    public PaymentResponse refundPayment(
            Long paymentId
    ) {

        if (paymentId == null) {

            throw new BadRequestException(
                    "Payment ID is required."
            );
        }

        Payment payment =
                paymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found with id: "
                                                + paymentId
                                )
                        );

        // -------------------------------------------------
        // PAYMENT STATUS CHECK
        // -------------------------------------------------

        if (payment.getStatus()
                != PaymentStatus.PAID) {

            throw new BadRequestException(
                    "Only PAID payments can be refunded."
            );
        }

        // -------------------------------------------------
        // RAZORPAY PAYMENT ID CHECK
        // -------------------------------------------------

        if (payment.getRazorpayPaymentId() == null ||
                payment.getRazorpayPaymentId().isBlank()) {

            throw new BadRequestException(
                    "Razorpay payment ID is missing."
            );
        }

        // -------------------------------------------------
        // BOOKING CHECK
        // -------------------------------------------------

        if (payment.getBooking() == null) {

            throw new BadRequestException(
                    "Payment is not associated with a booking."
            );
        }

        try {

            // -------------------------------------------------
            // REFUND AMOUNT
            // -------------------------------------------------

            long amountInPaise =
                    payment.getAmount()
                            .multiply(
                                    BigDecimal.valueOf(100)
                            )
                            .longValueExact();

            JSONObject refundRequest =
                    new JSONObject();

            refundRequest.put(
                    "amount",
                    amountInPaise
            );

            refundRequest.put(
                    "receipt",
                    "refund_booking_" +
                            payment.getBooking()
                                    .getId()
            );

            // -------------------------------------------------
            // CREATE RAZORPAY REFUND
            // -------------------------------------------------

            com.razorpay.Refund refund =
                    razorpayClient.payments.refund(
                            payment.getRazorpayPaymentId(),
                            refundRequest
                    );

            // -------------------------------------------------
            // VERIFY REFUND RESPONSE
            // -------------------------------------------------

            if (refund == null ||
                    refund.get("id") == null) {

                throw new RuntimeException(
                        "Razorpay refund was not created."
                );
            }

            // -------------------------------------------------
            // UPDATE DATABASE
            // -------------------------------------------------

            payment.setStatus(
                    PaymentStatus.REFUNDED
            );

            Payment savedPayment =
                    paymentRepository.save(
                            payment
                    );

            return toResponse(
                    savedPayment
            );

        } catch (BadRequestException e) {

            throw e;

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Unable to process Razorpay refund: "
                            + e.getMessage(),
                    e
            );
        }
    }


    // =====================================================
    // ADMIN - GET ALL PAYMENTS
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =====================================================
    // VERIFY RAZORPAY SIGNATURE
    // =====================================================

    private boolean verifySignature(
            String orderId,
            String paymentId,
            String signature
    ) {

        try {

            String payload =
                    orderId +
                            "|" +
                            paymentId;

            Mac mac =
                    Mac.getInstance(
                            "HmacSHA256"
                    );

            SecretKeySpec secretKey =
                    new SecretKeySpec(
                            razorpayKeySecret.getBytes(
                                    StandardCharsets.UTF_8
                            ),
                            "HmacSHA256"
                    );

            mac.init(
                    secretKey
            );

            byte[] hash =
                    mac.doFinal(
                            payload.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            String generatedSignature =
                    HexFormat.of()
                            .formatHex(hash);

            return constantTimeEquals(
                    generatedSignature,
                    signature
            );

        } catch (Exception e) {

            return false;
        }
    }


    // =====================================================
    // CONSTANT TIME COMPARISON
    // =====================================================

    private boolean constantTimeEquals(
            String first,
            String second
    ) {

        if (first == null ||
                second == null) {

            return false;
        }

        if (first.length() !=
                second.length()) {

            return false;
        }

        int result = 0;

        for (int i = 0;
             i < first.length();
             i++) {

            result |=
                    first.charAt(i)
                            ^
                            second.charAt(i);
        }

        return result == 0;
    }


    // =====================================================
    // PAYMENT → RESPONSE
    // =====================================================

    private PaymentResponse toResponse(
            Payment payment
    ) {

        return PaymentResponse.builder()

                .paymentId(
                        payment.getId()
                )

                .bookingId(
                        payment.getBooking()
                                .getId()
                )

                .amount(
                        payment.getAmount()
                )

                .currency(
                        payment.getCurrency()
                )

                .razorpayOrderId(
                        payment.getRazorpayOrderId()
                )

                .razorpayPaymentId(
                        payment.getRazorpayPaymentId()
                )

                .status(
                        payment.getStatus()
                )

                .build();
    }
}