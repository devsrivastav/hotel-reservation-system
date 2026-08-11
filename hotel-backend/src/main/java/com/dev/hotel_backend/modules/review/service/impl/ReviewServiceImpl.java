package com.dev.hotel_backend.modules.review.service.impl;

import com.dev.hotel_backend.entity.User;
import com.dev.hotel_backend.exception.BadRequestException;
import com.dev.hotel_backend.exception.ResourceNotFoundException;
import com.dev.hotel_backend.modules.hotel.entity.Hotel;
import com.dev.hotel_backend.modules.hotel.repository.HotelRepository;
import com.dev.hotel_backend.modules.review.dto.request.CreateReviewRequest;
import com.dev.hotel_backend.modules.review.dto.response.ReviewResponse;
import com.dev.hotel_backend.modules.review.entity.Review;
import com.dev.hotel_backend.modules.review.mapper.ReviewMapper;
import com.dev.hotel_backend.modules.review.repository.ReviewRepository;
import com.dev.hotel_backend.modules.review.service.ReviewService;
import com.dev.hotel_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;

    @Override
    public ReviewResponse createReview(CreateReviewRequest request,
                                       String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Hotel not found"));

        if (reviewRepository.existsByUserIdAndHotelId(
                user.getId(),
                hotel.getId())) {

            throw new BadRequestException(
                    "You have already reviewed this hotel.");
        }

        Review review = Review.builder()
                .user(user)
                .hotel(hotel)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        return ReviewMapper.toResponse(review);
    }

    @Override
    public List<ReviewResponse> getReviewsByHotel(Long hotelId) {

        return reviewRepository.findByHotelId(hotelId)
                .stream()
                .map(ReviewMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteReview(Long reviewId,
                             String userEmail) {

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new BadRequestException(
                    "You are not allowed to delete this review.");
        }

        reviewRepository.delete(review);
    }
}