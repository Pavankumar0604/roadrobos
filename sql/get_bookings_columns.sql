-- Get all column names from the bookings table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'bookings'
ORDER BY ordinal_position;
