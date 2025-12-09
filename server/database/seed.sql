-- Sample Data for RoAd RoBo's Bike Rentals Database
-- Run this after schema.sql to populate with test data

-- ============================================================================
-- SAMPLE CITIES
-- ============================================================================

INSERT INTO cities (name, image_url, is_active) VALUES
('Bangalore', '/images/cities/bangalore.jpg', TRUE),
('Mumbai', '/images/cities/mumbai.jpg', TRUE),
('Delhi', '/images/cities/delhi.jpg', TRUE),
('Pune', '/images/cities/pune.jpg', TRUE),
('Hyderabad', '/images/cities/hyderabad.jpg', TRUE);

-- ============================================================================
-- SAMPLE BIKES
-- ============================================================================

INSERT INTO bikes (
  name, type, cc, transmission,
  price_hour, price_day, price_week, price_month,
  km_limit_hour, km_limit_day, km_limit_week, km_limit_month,
  excess_km_charge, deposit, availability
) VALUES
-- Scooters
('Honda Activa 6G', 'Scooter', '110cc', 'Automatic', 49, 299, 1799, 5999, 10, 100, 700, 3000, 3, 1000, 'Available'),
('TVS Jupiter', 'Scooter', '110cc', 'Automatic', 49, 299, 1799, 5999, 10, 100, 700, 3000, 3, 1000, 'Available'),
('Suzuki Access 125', 'Scooter', '125cc', 'Automatic', 59, 349, 2099, 6999, 10, 100, 700, 3000, 3, 1000, 'Available'),

-- Fuel Bikes
('Hero Splendor Plus', 'Fuel', '97cc', 'Manual', 39, 249, 1499, 4999, 10, 100, 700, 3000, 3, 1000, 'Available'),
('Bajaj Pulsar 150', 'Fuel', '150cc', 'Manual', 69, 399, 2399, 7999, 10, 100, 700, 3000, 3, 1500, 'Available'),
('Royal Enfield Classic 350', 'Fuel', '350cc', 'Manual', 149, 899, 5399, 17999, 10, 100, 700, 3000, 5, 3000, 'Available'),

-- Electric
('Ather 450X', 'Electric', 'Electric', 'Automatic', 79, 499, 2999, 9999, 15, 150, 1000, 4000, 4, 2000, 'Available'),
('Ola S1 Pro', 'Electric', 'Electric', 'Automatic', 79, 499, 2999, 9999, 15, 150, 1000, 4000, 4, 2000, 'Limited'),

-- Superbikes
('KTM Duke 390', 'Superbike', '390cc', 'Manual', 199, 1199, 7199, 23999, 10, 100, 700, 3000, 7, 5000, 'Available'),
('Royal Enfield Himalayan', 'Superbike', '411cc', 'Manual', 199, 1199, 7199, 23999, 10, 100, 700, 3000, 7, 5000, 'Available');

-- ============================================================================
-- SAMPLE BIKE IMAGES
-- ============================================================================

-- Honda Activa (bike_id: 1)
INSERT INTO bike_images (bike_id, image_url, display_order, is_primary) VALUES
(1, '/images/bikes/activa-red.jpg', 0, TRUE),
(1, '/images/bikes/activa-black.jpg', 1, FALSE),
(1, '/images/bikes/activa-white.jpg', 2, FALSE);

-- TVS Jupiter (bike_id: 2)
INSERT INTO bike_images (bike_id, image_url, display_order, is_primary) VALUES
(2, '/images/bikes/jupiter-grey.jpg', 0, TRUE),
(2, '/images/bikes/jupiter-red.jpg', 1, FALSE);

-- Suzuki Access (bike_id: 3)
INSERT INTO bike_images (bike_id, image_url, display_order, is_primary) VALUES
(3, '/images/bikes/access-blue.jpg', 0, TRUE),
(3, '/images/bikes/access-grey.jpg', 1, FALSE);

-- Hero Splendor (bike_id: 4)
INSERT INTO bike_images (bike_id, image_url, display_order, is_primary) VALUES
(4, '/images/bikes/splendor-black.jpg', 0, TRUE),
(4, '/images/bikes/splendor-red.jpg', 1, FALSE);

-- Bajaj Pulsar (bike_id: 5)
INSERT INTO bike_images (bike_id, image_url, display_order, is_primary) VALUES
(5, '/images/bikes/pulsar-blue.jpg', 0, TRUE),
(5, '/images/bikes/pulsar-red.jpg', 1, FALSE),
(5, '/images/bikes/pulsar-black.jpg', 2, FALSE);

-- Royal Enfield Classic (bike_id: 6)
INSERT INTO bike_images (bike_id, image_url, display_order, is_primary) VALUES
(6, '/images/bikes/classic-black.jpg', 0, TRUE),
(6, '/images/bikes/classic-desert.jpg', 1, FALSE),
(6, '/images/bikes/classic-chrome.jpg', 2, FALSE);

-- Ather 450X (bike_id: 7)
INSERT INTO bike_images (bike_id, image_url, display_order, is_primary) VALUES
(7, '/images/bikes/ather-grey.jpg', 0, TRUE),
(7, '/images/bikes/ather-green.jpg', 1, FALSE);

-- Ola S1 Pro (bike_id: 8)
INSERT INTO bike_images (bike_id, image_url, display_order, is_primary) VALUES
(8, '/images/bikes/ola-black.jpg', 0, TRUE),
(8, '/images/bikes/ola-pink.jpg', 1, FALSE);

-- KTM Duke (bike_id: 9)
INSERT INTO bike_images (bike_id, image_url, display_order, is_primary) VALUES
(9, '/images/bikes/duke-orange.jpg', 0, TRUE),
(9, '/images/bikes/duke-white.jpg', 1, FALSE);

-- Royal Enfield Himalayan (bike_id: 10)
INSERT INTO bike_images (bike_id, image_url, display_order, is_primary) VALUES
(10, '/images/bikes/himalayan-grey.jpg', 0, TRUE),
(10, '/images/bikes/himalayan-white.jpg', 1, FALSE);

-- ============================================================================
-- SAMPLE COLOR VARIANTS
-- ============================================================================

INSERT INTO bike_color_variants (bike_id, color_name, image_index) VALUES
-- Activa
(1, 'Red', 0),
(1, 'Black', 1),
(1, 'White', 2),

-- Jupiter
(2, 'Grey', 0),
(2, 'Red', 1),

-- Pulsar
(5, 'Blue', 0),
(5, 'Red', 1),
(5, 'Black', 2);

-- ============================================================================
-- SAMPLE FAQs
-- ============================================================================

INSERT INTO faqs (category, question, answer, display_order, is_active) VALUES
('General', 'What documents do I need to rent a bike?', 'You need a valid driving license, Aadhaar card or PAN card for ID proof, and local address proof.', 1, TRUE),
('General', 'What is the minimum age to rent a bike?', 'You must be at least 18 years old with a valid driving license to rent a bike.', 2, TRUE),
('General', 'Do you provide helmets?', 'Yes, we provide complimentary helmets with every rental. Additional helmets are available for ₹50/day.', 3, TRUE),

('Booking', 'How do I book a bike?', 'You can book online through our website or mobile app. Select your bike, pickup date/time, and complete the payment.', 1, TRUE),
('Booking', 'What is the minimum booking duration?', 'Minimum booking is 1 hour for hourly rentals and 1 day for daily rentals.', 2, TRUE),
('Booking', 'Can I extend my rental period?', 'Yes, you can extend your rental by contacting our support team. Extension charges apply as per daily rates.', 3, TRUE),
('Booking', 'What is the cancellation policy?', 'Free cancellation up to 24 hours before pickup. Cancellations within 24 hours incur a 50% charge.', 4, TRUE),

('Payment', 'What payment methods do you accept?', 'We accept UPI, credit/debit cards, net banking, and digital wallets through Razorpay.', 1, TRUE),
('Payment', 'Is there a security deposit?', 'Yes, a refundable security deposit is required based on the bike type. It will be refunded within 7 days after return.', 2, TRUE),
('Payment', 'Are there any hidden charges?', 'No hidden charges! All costs are transparent. Excess km charges apply if you exceed the km limit.', 3, TRUE),

('Partner', 'How can I become a partner?', 'Fill out our partner application form with your details. Our team will contact you within 2-3 business days.', 1, TRUE);

-- ============================================================================
-- SAMPLE SITE CONTENT
-- ============================================================================

INSERT INTO site_content (section, key_name, value) VALUES
('home', 'hero_title_template', 'Rent {0} in {1}'),
('home', 'hero_subtitle', 'Premium bikes at affordable prices. Book now and ride in style!'),
('contact', 'email', 'contact@roadrobos.com'),
('contact', 'phone', '+91 9876543210'),
('contact', 'address', '13 & 14, Horamavu Agara Village, Kalyan Nagar, Bengaluru - 560043'),
('social', 'facebook', 'https://facebook.com/roadrobos'),
('social', 'instagram', 'https://instagram.com/roadrobos'),
('social', 'twitter', 'https://twitter.com/roadrobos');

-- ============================================================================
-- SAMPLE OFFERS
-- ============================================================================

INSERT INTO offers (
  id, title, type, code, discount_percent, validity_date,
  applicable_cities, image_placeholder, description_bullets,
  status, usage_limit_per_user, total_uses
) VALUES
(
  UUID(),
  'First Ride Free',
  'first',
  'FIRST100',
  100,
  '2025-12-31',
  '["Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad"]',
  '🎉',
  '["Get your first hour absolutely free", "Valid for new users only", "Auto-applied on first booking"]',
  'Active',
  1,
  0
),
(
  UUID(),
  'Student Special',
  'seasonal',
  'STUDENT20',
  20,
  '2025-12-31',
  '["Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad"]',
  '🎓',
  '["20% off on all bookings", "Show valid student ID", "Valid for bookings above ₹500"]',
  'Active',
  999,
  0
),
(
  UUID(),
  'Weekend Blast',
  'seasonal',
  'WEEKEND30',
  30,
  '2025-12-31',
  '["Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad"]',
  '🎊',
  '["30% off on weekend rentals", "Saturday & Sunday only", "Book for minimum 2 days"]',
  'Active',
  999,
  0
);

-- ============================================================================
-- Done!
-- ============================================================================

SELECT 'Sample data inserted successfully!' as message;
