package com.dev.hotel_backend.modules.payment.entity;

import com.dev.hotel_backend.modules.booking.entity.Booking;
import com.dev.hotel_backend.modules.payment.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // BOOKING
    // =====================================================

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "booking_id",
            nullable = false,
            unique = true
    )
    private Booking booking;

    // =====================================================
    // RAZORPAY ORDER
    // =====================================================

    @Column(
            name = "razorpay_order_id",
            nullable = false,
            unique = true
    )
    private String razorpayOrderId;

    // =====================================================
    // RAZORPAY PAYMENT
    // =====================================================

    @Column(
            name = "razorpay_payment_id",
            unique = true
    )
    private String razorpayPaymentId;

    // =====================================================
    // RAZORPAY SIGNATURE
    // =====================================================

    @Column(
            name = "razorpay_signature"
    )
    private String razorpaySignature;

    // =====================================================
    // AMOUNT
    // =====================================================

    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal amount;

    // =====================================================
    // CURRENCY
    // =====================================================

    @Column(
            nullable = false,
            length = 10
    )
    private String currency;

    // =====================================================
    // PAYMENT STATUS
    // =====================================================

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private PaymentStatus status;

    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // =====================================================
    // PAID AT
    // =====================================================

    private LocalDateTime paidAt;

    // =====================================================
    // PRE PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}