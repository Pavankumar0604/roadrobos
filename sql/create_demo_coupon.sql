-- SQL to insert the Demo Coupon (100% Discount)
-- Use this in the Supabase SQL Editor

INSERT INTO public.offers (
    id,
    title,
    type,
    code,
    discount_percent,
    validity_date,
    applicable_cities,
    min_booking,
    image_placeholder,
    description_bullets,
    status,
    usage_limit_per_user,
    total_uses,
    flat_amount -- explicit null
) VALUES (
    'o_demo_1610',
    'Demo 100% OFF (Test)',
    'app',
    'demo@1610',
    100, -- 100% Discount
    '2099-12-31', -- Forever valid
    ARRAY['All'],
    '0',
    'https://placehold.co/600x400?text=100%25+OFF',
    ARRAY['100% Discount for testing', 'Only Platform Fee Applicable', 'Unlimited Usage'],
    'Active',
    999999, -- Effectively unlimited per user
    0,
    NULL
);

-- Checks if inserted
SELECT * FROM public.offers WHERE code = 'demo@1610';
