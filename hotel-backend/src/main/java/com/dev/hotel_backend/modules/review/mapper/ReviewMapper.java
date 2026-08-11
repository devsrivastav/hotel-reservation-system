package com.dev.hotel_backend.modules.review.mapper;

import com.dev.hotel_backend.modules.review.dto.response.ReviewResponse;
import com.dev.hotel_backend.modules.review.entity.Review;

public class ReviewMapper {

    private ReviewMapper() {
    }

    public static ReviewResponse toResponse(Review review) {

        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(
                        review.getUser().getFirstName() + " " +
                                review.getUser().getLastName()
                )
                .hotelId(review.getHotel().getId())
                .hotelName(review.getHotel().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}