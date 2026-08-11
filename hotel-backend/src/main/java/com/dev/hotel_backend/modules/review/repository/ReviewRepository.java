package com.dev.hotel_backend.modules.review.repository;

import com.dev.hotel_backend.modules.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByHotelId(Long hotelId);

    List<Review> findByUserId(Long userId);

    boolean existsByUserIdAndHotelId(Long userId, Long hotelId);

    @Query("""
    SELECT COALESCE(AVG(r.rating), 0)
    FROM Review r
    WHERE r.hotel.id = :hotelId
    """)
    Double getAverageRatingByHotelId(Long hotelId);

    @Query("""
    SELECT COUNT(r)
    FROM Review r
    WHERE r.hotel.id = :hotelId
    """)
    Long getTotalReviewsByHotelId(Long hotelId);
}