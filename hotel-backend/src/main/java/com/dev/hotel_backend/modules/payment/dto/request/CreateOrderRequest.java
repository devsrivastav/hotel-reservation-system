package com.dev.hotel_backend.modules.payment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @NotNull
    private Long bookingId;
}
