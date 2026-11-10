CREATE DATABASE hotel_reservation_db;
use hotel_reservation_db;
SELECT DATABASE();
SHOW CREATE TABLE payments;
SHOW TRIGGERS LIKE 'payments';
show tables;
DESCRIBE hotels;
DESCRIBE payments;
SELECT * FROM admin;
SELECT * FROM users;
SELECT * FROM roles;
SELECT * FROM rooms;
SELECT * FROM hotels;
SELECT * FROM bookings;
SELECT * FROM payments;
SELECT * FROM reviews;
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

UPDATE users
SET role_id = (
    SELECT id
    FROM roles
    WHERE name = 'ROLE_ADMIN'
)
WHERE email = 'your-email@gmail.com'; 
INSERT INTO roles(name) VALUES ('ROLE_SUPER_ADMIN');
INSERT INTO roles(name) VALUES ('ROLE_ADMIN');
INSERT INTO roles(name) VALUES ('ROLE_CUSTOMER');


SELECT
u.id,
u.email,
r.name
FROM users u
JOIN roles r
ON u.role_id = r.id;

SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    r.name AS role
FROM users u
JOIN roles r ON u.role_id = r.id;

SELECT
    id,
    booking_id,
    amount,
    currency,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    status,
    paid_at
FROM payments
ORDER BY id DESC
LIMIT 5;



ALTER TABLE payments
DROP COLUMN order_id;

SELECT
    id,
    booking_id,
    amount,
    razorpay_payment_id,
    status
FROM payments
WHERE status = 'PAID'
ORDER BY id DESC
LIMIT 5;


SELECT 
    u.id,
    u.email,
    u.role_id,
    r.name AS role_name
FROM users u
JOIN roles r ON u.role_id = r.id;


UPDATE users
SET role_id = (
    SELECT id
    FROM roles
    WHERE name = 'ROLE_ADMIN'
)
WHERE email = 'YOUR_ADMIN_EMAIL';



SELECT
    id,
    booking_id,
    amount,
    status,
    razorpay_payment_id,
    razorpay_order_id
FROM payments
WHERE id = 6;