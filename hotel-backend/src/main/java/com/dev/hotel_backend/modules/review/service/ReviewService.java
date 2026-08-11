package com.dev.hotel_backend.modules.review.service;

import com.dev.hotel_backend.modules.review.dto.request.CreateReviewRequest;
import com.dev.hotel_backend.modules.review.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(
            CreateReviewRequest request,
            String userEmail);

    List<ReviewResponse> getReviewsByHotel(Long hotelId);

    void deleteReview(
            Long reviewId,
            String userEmail);
}