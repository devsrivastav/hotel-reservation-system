package com.dev.hotel_backend.modules.payment.dto.response;



import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CreateOrderResponse {

    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String key;
}
