package com.dev.hotel_backend.modules.review.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ReviewResponse {

    private Long id;

    private Long userId;
    private String userName;

    private Long hotelId;
    private String hotelName;

    private Integer rating;

    private String comment;

    private LocalDateTime createdAt;
}