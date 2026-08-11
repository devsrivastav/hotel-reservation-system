package com.dev.hotel_backend.modules.payment.dto.response;

import com.dev.hotel_backend.modules.payment.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class PaymentResponse {

    private Long paymentId;

    private Long bookingId;

    private BigDecimal amount;

    private String currency;

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private PaymentStatus status;
}