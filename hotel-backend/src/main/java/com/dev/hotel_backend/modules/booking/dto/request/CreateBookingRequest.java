package com.dev.hotel_backend.modules.booking.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {

    @NotNull
    private Long roomId;

    @NotNull
    @Future
    private LocalDate checkInDate;

    @NotNull
    @Future
    private LocalDate checkOutDate;

    @Min(1)
    private Integer numberOfGuests;
}