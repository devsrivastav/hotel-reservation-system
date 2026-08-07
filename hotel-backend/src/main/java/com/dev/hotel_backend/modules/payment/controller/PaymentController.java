package com.dev.hotel_backend.modules.payment.controller;

import com.dev.hotel_backend.modules.payment.dto.request.CreateOrderRequest;
import com.dev.hotel_backend.modules.payment.dto.response.CreateOrderResponse;
import com.dev.hotel_backend.modules.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public CreateOrderResponse createOrder(
            @Valid @RequestBody CreateOrderRequest request) throws Exception {

        return paymentService.createOrder(request);
    }
}
