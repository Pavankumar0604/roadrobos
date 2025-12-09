-- =====================================================
-- COMPLETE SUPABASE SETUP FOR ROADROBOS
-- =====================================================
-- Run this in Supabase SQL Editor to set up everything

-- ==================== PART 1: TABLE COLUMNS ====================

-- Add missing columns for document validation
ALTER TABLE public.rider_information 
ADD COLUMN IF NOT EXISTS aadhaar_number text,
ADD COLUMN IF NOT EXISTS pan_number text,
ADD COLUMN IF NOT EXISTS aadhaar_document_url text,
ADD COLUMN IF NOT EXISTS pan_document_url text;

-- Ensure bookings table has all required columns
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS transaction_id text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Ensure transactions table has all required columns  
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
ADD COLUMN IF NOT EXISTS razorpay_signature text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ==================== PART 2: STORAGE BUCKET ====================

-- Create storage bucket for document uploads (Aadhaar, PAN cards)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET 
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- ==================== PART 3: RLS POLICIES ====================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all for rider_information" ON public.rider_information;
DROP POLICY IF EXISTS "Allow all for bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all for transactions" ON public.transactions;

-- Enable RLS
ALTER TABLE public.rider_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for Edge Functions
CREATE POLICY "Allow all for rider_information"
    ON public.rider_information FOR ALL
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for bookings"
    ON public.bookings FOR ALL
    USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for transactions"
    ON public.transactions FOR ALL
    USING (true) WITH CHECK (true);

-- ==================== PART 4: STORAGE POLICIES ====================

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Public upload allowed" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload resumes" ON storage.objects;

-- Documents bucket policies
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

CREATE POLICY "Public upload allowed"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'documents');

-- Resumes bucket policies
CREATE POLICY "Users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Users can view resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

CREATE POLICY "Public can upload resumes"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'resumes');

-- ==================== PART 5: ADMIN TABLES ====================

-- Ensure bikes table exists with all fields
CREATE TABLE IF NOT EXISTS public.bikes (
    id serial PRIMARY KEY,
    name text NOT NULL,
    type text DEFAULT 'Scooter',
    availability text DEFAULT 'Available',
    cc text,
    transmission text DEFAULT 'Automatic',
    price_hour numeric DEFAULT 0,
    price_day numeric DEFAULT 0,
    price_week numeric DEFAULT 0,
    price_month numeric DEFAULT 0,
    deposit numeric DEFAULT 0,
    km_limit_hour integer DEFAULT 0,
    km_limit_day integer DEFAULT 0,
    km_limit_week integer DEFAULT 0,
    km_limit_month integer DEFAULT 0,
    excess_km_charge numeric DEFAULT 0,
    min_booking_hour integer DEFAULT 0,
    min_booking_day integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ensure bike_images table exists
CREATE TABLE IF NOT EXISTS public.bike_images (
    id serial PRIMARY KEY,
    bike_id integer REFERENCES public.bikes(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    display_order integer DEFAULT 0
);

-- Ensure pickup_locations table exists
CREATE TABLE IF NOT EXISTS public.pickup_locations (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    address text,
    city text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Ensure offers table exists
CREATE TABLE IF NOT EXISTS public.offers (
    id text PRIMARY KEY,
    title text NOT NULL,
    code text,
    discount_percent numeric,
    flat_amount numeric,
    status text DEFAULT 'Active',
    usage_limit_per_user integer DEFAULT 1,
    total_uses integer DEFAULT 0,
    type text DEFAULT 'seasonal',
    image_placeholder text,
    applicable_cities text[],
    created_at timestamptz DEFAULT now()
);

-- Ensure enquiries table exists
CREATE TABLE IF NOT EXISTS public.enquiries (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    message text,
    status text DEFAULT 'New',
    created_at timestamptz DEFAULT now()
);

-- Ensure reviews table exists
CREATE TABLE IF NOT EXISTS public.reviews (
    id text PRIMARY KEY,
    user_id text,
    name text NOT NULL,
    rating integer NOT NULL,
    text text,
    status text DEFAULT 'Pending',
    created_at timestamptz DEFAULT now()
);

-- Ensure employees table exists
CREATE TABLE IF NOT EXISTS public.employees (
    id text PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'Support',
    status text DEFAULT 'Active',
    joined_date timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Ensure job_applications table exists
CREATE TABLE IF NOT EXISTS public.job_applications (
    id text PRIMARY KEY,
    applicant_name text NOT NULL,
    email text NOT NULL,
    phone text,
    position text,
    resume_url text,
    status text DEFAULT 'Pending',
    applied_date timestamptz DEFAULT now()
);

-- Ensure site_content table has required columns (handles existing table)
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'hero_headline') THEN
        ALTER TABLE public.site_content ADD COLUMN hero_headline text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'hero_tagline') THEN
        ALTER TABLE public.site_content ADD COLUMN hero_tagline text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'about_text') THEN
        ALTER TABLE public.site_content ADD COLUMN about_text text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'contact_email') THEN
        ALTER TABLE public.site_content ADD COLUMN contact_email text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'contact_phone') THEN
        ALTER TABLE public.site_content ADD COLUMN contact_phone text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'contact_address') THEN
        ALTER TABLE public.site_content ADD COLUMN contact_address text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'footer_text') THEN
        ALTER TABLE public.site_content ADD COLUMN footer_text text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_content' AND column_name = 'updated_at') THEN
        ALTER TABLE public.site_content ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- ==================== PART 6: ADMIN RLS ====================

ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Public can read bikes" ON public.bikes;
DROP POLICY IF EXISTS "Public can read bike_images" ON public.bike_images;
DROP POLICY IF EXISTS "Public can read locations" ON public.pickup_locations;
DROP POLICY IF EXISTS "Public can read active offers" ON public.offers;
DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can read site_content" ON public.site_content;
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Public can submit reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can apply for jobs" ON public.job_applications;
DROP POLICY IF EXISTS "Admin bikes" ON public.bikes;
DROP POLICY IF EXISTS "Admin bike_images" ON public.bike_images;
DROP POLICY IF EXISTS "Admin locations" ON public.pickup_locations;
DROP POLICY IF EXISTS "Admin offers" ON public.offers;
DROP POLICY IF EXISTS "Admin enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Admin reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admin employees" ON public.employees;
DROP POLICY IF EXISTS "Admin applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admin site_content" ON public.site_content;

-- Public read policies (for website)
CREATE POLICY "Public can read bikes" ON public.bikes FOR SELECT USING (true);
CREATE POLICY "Public can read bike_images" ON public.bike_images FOR SELECT USING (true);
CREATE POLICY "Public can read locations" ON public.pickup_locations FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active offers" ON public.offers FOR SELECT USING (status = 'Active');
CREATE POLICY "Public can read approved reviews" ON public.reviews FOR SELECT USING (status = 'Approved');
CREATE POLICY "Public can read site_content" ON public.site_content FOR SELECT USING (true);

-- Public can submit enquiries and reviews
CREATE POLICY "Public can submit enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can apply for jobs" ON public.job_applications FOR INSERT WITH CHECK (true);

-- Admin full access (using service role)
CREATE POLICY "Admin bikes" ON public.bikes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin bike_images" ON public.bike_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin locations" ON public.pickup_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin offers" ON public.offers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin enquiries" ON public.enquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin applications" ON public.job_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin site_content" ON public.site_content FOR ALL USING (true) WITH CHECK (true);

-- ==================== VERIFICATION ====================

SELECT 'Setup complete! Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
