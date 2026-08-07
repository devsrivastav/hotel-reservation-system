package com.dev.hotel_backend.modules.payment.service;

import com.dev.hotel_backend.modules.payment.dto.request.CreateOrderRequest;
import com.dev.hotel_backend.modules.payment.dto.response.CreateOrderResponse;

public interface PaymentService {

    CreateOrderResponse createOrder(CreateOrderRequest request) throws Exception;

}
