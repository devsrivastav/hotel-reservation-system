package com.dev.hotel_backend.modules.review.controller;

import com.dev.hotel_backend.modules.review.dto.request.CreateReviewRequest;
import com.dev.hotel_backend.modules.review.dto.response.ReviewResponse;
import com.dev.hotel_backend.modules.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ReviewResponse createReview(
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {

        return reviewService.createReview(
                request,
                authentication.getName());
    }

    @GetMapping("/hotel/{hotelId}")
    public List<ReviewResponse> getReviewsByHotel(
            @PathVariable Long hotelId) {

        return reviewService.getReviewsByHotel(hotelId);
    }

    @DeleteMapping("/{reviewId}")
    public String deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {

        reviewService.deleteReview(
                reviewId,
                authentication.getName());

        return "Review deleted successfully";
    }
}