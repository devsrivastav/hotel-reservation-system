package com.dev.hotel_backend.modules.hotel.entity;

import com.dev.hotel_backend.modules.room.entity.Room;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hotels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String country;

    private String zipCode;

    private String phone;

    private String email;

    private Integer starRating;

    private LocalTime checkInTime;

    private LocalTime checkOutTime;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    @OneToMany(mappedBy = "hotel",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Room> rooms = new ArrayList<>();

    @Column(name = "image_url")
    private String imageUrl;
}
