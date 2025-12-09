-- Helper to clear existing data if needed (optional)
-- TRUNCATE TABLE public.bikes, public.bike_images, public.bike_color_variants, public.offers, public.locations, public.enquiries, public.reviews CASCADE;

-- 1. BIKES
INSERT INTO public.bikes (id, name, type, cc, transmission, price_hour, price_day, price_week, price_month, price_quarterly, price_yearly, min_booking_hour, min_booking_day, km_limit_hour, km_limit_day, km_limit_week, km_limit_month, excess_km_charge, deposit, availability)
VALUES 
(801, 'Zelio Eeva E (Silver)', 'Electric', 'Top Speed: 50 km/h', 'Automatic', 35, 450, 1850, 7400, 20000, 70000, 10, 1, 10, 120, 700, 2500, 4, 2000, 'Available'),
(802, 'Zelio Eeva E (Red)', 'Electric', 'Top Speed: 50 km/h', 'Automatic', 35, 450, 1850, 7400, 20000, 70000, 10, 1, 10, 120, 700, 2500, 4, 2000, 'Available'),
(803, 'Zelio Eeva E (Blue)', 'Electric', 'Top Speed: 50 km/h', 'Automatic', 35, 450, 1850, 7400, 20000, 70000, 10, 1, 10, 120, 700, 2500, 4, 2000, 'Available'),
(804, 'Zelio Eeva E (White)', 'Electric', 'Top Speed: 50 km/h', 'Automatic', 35, 450, 1850, 7400, 20000, 70000, 10, 1, 10, 120, 700, 2500, 4, 2000, 'Available'),
(805, 'Zelio Eeva E (Black)', 'Electric', 'Top Speed: 50 km/h', 'Automatic', 35, 450, 1850, 7400, 20000, 70000, 10, 1, 10, 120, 700, 2500, 4, 2000, 'Available'),
(6, 'Ather 450X', 'Electric', 'Electric', 'Automatic', 40, 443, 3100, 13300, 39900, 159600, 10, 1, 10, 120, 700, 2500, 4, 2000, 'Coming Soon'),
(1, 'Honda Activa 6G', 'Scooter', '110cc', 'Automatic', 40, 443, 3100, 13300, 39900, 159600, 10, 1, 10, 100, 600, 2000, 4, 1000, 'Coming Soon'),
(2, 'Royal Enfield Classic 350', 'Gear', '350cc', 'Manual', 120, 1800, 10000, 30000, 81000, 288000, 10, 1, 10, 150, 900, 3000, 8, 2500, 'Coming Soon'),
(3, 'BMW G310 R', 'Superbike', '313cc', 'Manual', 160, 1890, 13200, 56800, 170400, 681600, 10, 1, 10, 200, 1200, 4000, 12, 3000, 'Coming Soon'),
(4, 'TVS Jupiter 125', 'Scooter', '125cc', 'Automatic', 40, 443, 3100, 13300, 39900, 159600, 10, 1, 10, 100, 600, 2000, 4, 1000, 'Coming Soon'),
(5, 'Yamaha MT-15', 'Gear', '155cc', 'Manual', 40, 443, 3100, 13300, 39900, 159600, 10, 1, 10, 150, 900, 3000, 6, 2000, 'Coming Soon')
ON CONFLICT (id) DO UPDATE SET 
price_day = EXCLUDED.price_day, availability = EXCLUDED.availability;

-- 2. BIKE IMAGES (Mapped to IDs)
INSERT INTO public.bike_images (bike_id, image_url, display_order)
VALUES
-- Zelio Silver (801)
(801, '/bikes/zeeoneevaesilver1.jpg', 1),
(801, '/bikes/zeeoneevaesilver2.jpg', 2),
(801, '/bikes/zeeoneevaesilver3.jpg', 3),

-- Zelio Red (802)
(802, '/bikes/zeeoneevaered1.jpg', 1),
(802, '/bikes/zeeoneevaered2.jpg', 2),
(802, '/bikes/zeeoneevaered3.jpg', 3),

-- Zelio Blue (803)
(803, '/bikes/zeeoneevaeblue1.jpg', 1),
(803, '/bikes/zeeoneevaeblue2.jpg', 2),
(803, '/bikes/zeeoneevaeblue3.jpg', 3),

-- Zelio White (804)
(804, '/bikes/zeeoneevaewhite1.jpg', 1),
(804, '/bikes/zeeoneevaewhite2.jpg', 2),

-- Zelio Black (805)
(805, '/bikes/zeeoneevaeblack1.jpg', 1),
(805, '/bikes/zeeoneevaeblack2.jpg', 2),
(805, '/bikes/zeeoneevaeblack3.jpg', 3),
(805, '/bikes/zeeoneevaeblack4.jpg', 4),
(805, '/bikes/zeeoneevaeblack5.jpg', 5),

-- Ather 450X (6)
(6, '/bikes/ather450x1.png', 1),
(6, '/bikes/ather450x2.png', 2),
(6, '/bikes/ather450x3.png', 3),

-- Honda Activa (1)
(1, '/bikes/hondaactiva1.png', 1),
(1, '/bikes/hondaactiva2.png', 2),
(1, '/bikes/hondaactiva3.png', 3),

-- RE Classic (2)
(2, '/bikes/royalenfieldclassic1.png', 1),
(2, '/bikes/royalenfieldclassic2.png', 2),

-- BMW (3)
(3, '/bikes/bmwg310r1.png', 1),
(3, '/bikes/bmwg310r2.png', 2),
(3, '/bikes/bmwg310r3.png', 3),

-- TVS Jupiter (4)
(4, '/bikes/tvsjupiter1251.png', 1),
(4, '/bikes/tvsjupiter1252.png', 2),

-- Yamaha MT-15 (5)
(5, '/bikes/yamahamt151.png', 1),
(5, '/bikes/yamahamt152.png', 2),
(5, '/bikes/yamahamt153.png', 3)
ON CONFLICT DO NOTHING;


-- 3. OFFERS
INSERT INTO public.offers (id, title, discount_percent, flat_amount, code, validity_date, applicable_cities, min_booking, image_placeholder, description_bullets, ends_in, status, usage_limit_per_user, total_uses, type)
VALUES
('o1', 'Flat 20% off on Gear Bikes (2+ days)', 20, NULL, 'GEAR20', '2025-11-30', ARRAY['Bangalore', 'Chennai'], '2 days', 'https://picsum.photos/seed/offer1/600/400', ARRAY['Minimum booking of 48 hours required.', 'Applicable on Royal Enfield, Yamaha, and BMW models.', 'Cannot be combined with other offers.'], 30, 'Active', 1, 112, 'seasonal'),
('o_welcome10', 'Welcome Offer — 10% off', 10, NULL, 'WELCOME10', '2025-12-31', ARRAY['All'], '₹500', 'https://picsum.photos/seed/offer_welcome10/600/400', ARRAY['Valid for new users.', 'Get 10% off on your first booking.', 'No maximum discount limit.'], NULL, 'Active', 1, 0, 'first'),
('o2', 'First Ride Special — ₹250 off', NULL, 250, 'WELCOME250', '2025-12-31', ARRAY['All'], '₹1000', 'https://picsum.photos/seed/offer2/600/400', ARRAY['Valid only for first-time users.', 'Minimum booking value of ₹1000.', 'Applicable on all bike models.'], NULL, 'Active', 1, 258, 'first'),
('o3', 'App Exclusive — 10% off', 10, NULL, NULL, 'Ongoing', ARRAY['All'], NULL, 'https://picsum.photos/seed/offer3/600/400', ARRAY['Offer automatically applied on app bookings.', 'Maximum discount of ₹150.', 'Valid on all bookings made via the RoAd RoBo’s app.'], NULL, 'Active', 99, 1045, 'app'),
('o4', 'Weekend Saver — Free Helmet + Insurance', NULL, 0, 'WKNDSAFE', 'Recurring (weekends)', ARRAY['Bangalore'], NULL, 'https://picsum.photos/seed/offer4/600/400', ARRAY['Get a complimentary second helmet and basic insurance.', 'Valid for bookings on Saturday & Sunday.', 'Applicable only in Bangalore.'], 2, 'Active', 1, 76, 'seasonal'),
('o5', 'Refer & Earn — ₹200 each', NULL, 200, NULL, 'Ongoing', ARRAY['All'], NULL, 'https://picsum.photos/seed/offer5/600/400', ARRAY['Share your referral code with friends.', 'You both get ₹200 in your wallet after their first ride.', 'No limit on referrals.'], NULL, 'Disabled', 99, 310, 'referral'),
('o6', 'Corporate Monthly Plan', NULL, NULL, NULL, 'Ongoing', ARRAY['All'], NULL, 'https://picsum.photos/seed/offer6/600/400', ARRAY['Special discounted rates for businesses.', 'Flexible monthly plans.', 'Contact our sales team for a custom quote.'], NULL, 'Active', 99, 45, 'corporate'),
('o7', 'Festive Ride Sale — Up to 25% Off', 25, NULL, 'FEST25', '2025-11-15', ARRAY['All'], NULL, 'https://picsum.photos/seed/offer7/600/400', ARRAY['Offer valid during the festive season.', 'Discount varies by bike model.', 'Check bike details for exact discount.'], 15, 'Active', 1, 189, 'seasonal'),
('o8', 'Electric Bike Week — 15% off EVs', 15, NULL, 'ECO15', '2025-10-31', ARRAY['All'], NULL, 'https://picsum.photos/seed/offer8/600/400', ARRAY['Promoting green rides!', 'Flat 15% off on all electric bikes.', 'Help us build a sustainable future.'], 20, 'Active', 1, 98, 'seasonal')
ON CONFLICT (id) DO NOTHING;

-- 4. LOCATIONS
INSERT INTO public.locations (name)
VALUES 
('Bangalore'), ('Babusapalya'), ('Shivajinagar'), ('Jayanagar'), ('Koramangala'), ('Ejipura'), ('Kanakapura Road'),
('Mysore'), ('Mangalore'), ('Hubli-Dharwad'), ('Gulbarga'), ('Chennai'), ('Hyderabad'), ('Delhi'), ('Mumbai'), ('Pune')
ON CONFLICT (name) DO NOTHING;

-- 5. SITE CONTENT
INSERT INTO public.site_content (id, content) 
VALUES (
    1, 
    '{"home": {"heroTitleTemplate": "Rent Bikes in [city] — From ₹35/hr", "heroSubtitle": "Hourly, daily & monthly rentals. Doorstep pickup, verified bikes & optional insurance."}, "contact": {"email": "chris@roadrobos.com", "phone": "+91-9844991225"}}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

-- 6. EMPLOYEES
INSERT INTO public.employees (name, email, role, status)
VALUES
('Rohan Sharma', 'rohan.s@roadrobos.com', 'Operations', 'Active'),
('Priya Verma', 'priya.v@roadrobos.com', 'Support', 'Active'),
('Amit Kumar', 'amit.k@roadrobos.com', 'Marketing', 'Inactive'),
('Sunita Menon', 'sunita.m@roadrobos.com', 'Tech', 'Active'),
('Chris Evans', 'chris.e@roadrobos.com', 'Operations', 'Active');
