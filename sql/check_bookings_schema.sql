-- Run this query in Supabase SQL Editor to see the exact column names
-- This will help us fix the payment-verify function

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
ORDER BY ordinal_position;
