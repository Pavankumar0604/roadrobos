-- ============================================
-- COMPREHENSIVE FIX FOR BOOKING ISSUES
-- ============================================

-- 1. Insert Demo Bike (with conflict handling)
INSERT INTO public.bikes (
    id, name, type, cc, transmission,
    price_hour, price_day, price_week, price_month, price_quarterly, price_yearly,
    min_booking_hour, min_booking_day,
    km_limit_hour, km_limit_day, km_limit_week, km_limit_month,
    excess_km_charge, deposit, availability
) VALUES (
    999, 'Demo Bike (Test)', 'Scooter', 'Test Spec', 'Automatic',
    1, 1, 1, 1, 1, 1,
    1, 1,
    10, 100, 500, 2000,
    1, 1, 'Available'
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    availability = EXCLUDED.availability;

-- 2. Insert Demo Bike Image
INSERT INTO public.bike_images (bike_id, image_url, display_order)
VALUES (999, 'https://placehold.co/600x400?text=Demo+Bike', 1)
ON CONFLICT (bike_id, display_order) DO NOTHING;

-- 3. Verify the bike exists
SELECT id, name, type, availability FROM public.bikes WHERE id = 999;

-- 4. Check if rider_information table has proper structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'rider_information'
ORDER BY ordinal_position;

-- 5. Check bookings table constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'bookings';
