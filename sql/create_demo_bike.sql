-- SQL to insert the Demo Bike (ID 999)
-- REQUIRED for bookings to work with the Demo Bike.

-- 1. Insert the Bike (using upsert logic manually or just insert)
INSERT INTO public.bikes (
    id,
    name,
    type,
    cc,
    transmission,
    price_hour,
    price_day,
    price_week,
    price_month,
    price_quarterly,
    price_yearly,
    min_booking_hour,
    min_booking_day,
    km_limit_hour,
    km_limit_day,
    km_limit_week,
    km_limit_month,
    excess_km_charge,
    deposit,
    availability
) VALUES (
    999,
    'Demo Bike (Test)',
    'Scooter',
    'Test Spec',
    'Automatic',
    1, 1, 1, 1, 1, 1, -- ₹1 pricing
    1, 1,
    10, 100, 500, 2000,
    1,
    1,
    'Available'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Bike Image (Optional but good for completeness)
INSERT INTO public.bike_images (
    bike_id,
    image_url,
    display_order
) VALUES (
    999,
    'https://placehold.co/600x400?text=Demo+Bike',
    1
) ON CONFLICT DO NOTHING;

-- 3. Verify
SELECT * FROM public.bikes WHERE id = 999;
