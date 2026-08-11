package com.dev.hotel_backend.modules.room.specification;

import com.dev.hotel_backend.modules.room.entity.Room;
import com.dev.hotel_backend.modules.room.enums.RoomStatus;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class RoomSpecification {

    public static Specification<Room> hasCity(String city) {
        return (root, query, cb) ->
                city == null || city.isBlank()
                        ? null
                        : cb.equal(
                        cb.lower(root.get("hotel").get("city")),
                        city.toLowerCase()
                );
    }

    public static Specification<Room> hasStatus(RoomStatus status) {
        return (root, query, cb) ->
                status == null
                        ? null
                        : cb.equal(root.get("status"), status);
    }

    public static Specification<Room> hasCapacity(Integer guests) {
        return (root, query, cb) ->
                guests == null
                        ? null
                        : cb.greaterThanOrEqualTo(root.get("capacity"), guests);
    }

    public static Specification<Room> minPrice(BigDecimal minPrice) {
        return (root, query, cb) ->
                minPrice == null
                        ? null
                        : cb.greaterThanOrEqualTo(root.get("pricePerNight"), minPrice);
    }

    public static Specification<Room> maxPrice(BigDecimal maxPrice) {
        return (root, query, cb) ->
                maxPrice == null
                        ? null
                        : cb.lessThanOrEqualTo(root.get("pricePerNight"), maxPrice);
    }
}