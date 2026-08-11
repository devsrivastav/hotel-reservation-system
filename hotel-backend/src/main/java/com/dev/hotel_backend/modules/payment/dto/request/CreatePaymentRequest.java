package com.dev.hotel_backend.modules.payment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePaymentRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;
}