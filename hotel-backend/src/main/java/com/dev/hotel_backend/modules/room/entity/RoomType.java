package com.dev.hotel_backend.modules.room.entity;

import com.dev.hotel_backend.modules.hotel.entity.Hotel;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer maxOccupancy;

    @Column(nullable = false)
    private Double basePrice;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}