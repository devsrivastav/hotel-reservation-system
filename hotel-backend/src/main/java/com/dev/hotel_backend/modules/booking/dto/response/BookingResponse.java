package com.dev.hotel_backend.modules.booking.dto.response;


import com.dev.hotel_backend.modules.booking.enums.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;

    private Long roomId;

    private String roomNumber;

    private Long userId;

    private String customerName;

    private LocalDate checkInDate;

    private LocalDate checkOutDate;

    private Integer numberOfGuests;

    private BigDecimal totalPrice;

    private BookingStatus status;
}
