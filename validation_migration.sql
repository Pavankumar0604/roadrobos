-- Add new columns for document numbers
ALTER TABLE public.rider_information 
ADD COLUMN IF NOT EXISTS aadhaar_number text,
ADD COLUMN IF NOT EXISTS pan_number text;

-- Add Unique Constraints to prevent duplicates
-- Note: Using a unique index allowing multiple NULLs is standard in Postgres default unique constraints
ALTER TABLE public.rider_information
ADD CONSTRAINT unique_aadhaar_number UNIQUE (aadhaar_number),
ADD CONSTRAINT unique_pan_number UNIQUE (pan_number);

-- Update RLS to allow inserts with these fields (existing policy should cover it, but good to double check if column list was restricted)
-- (No change needed since RLS is usually row-based)
