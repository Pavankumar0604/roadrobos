-- Add document URL columns to rider_information table
ALTER TABLE rider_information 
ADD COLUMN IF NOT EXISTS aadhaar_document_url TEXT,
ADD COLUMN IF NOT EXISTS pan_document_url TEXT,
ADD COLUMN IF NOT EXISTS license_document_url TEXT;

-- Create storage bucket for booking documents (run this in Supabase SQL Editor)
-- Note: This is a reference - actual bucket creation must be done via Supabase Dashboard or Storage API

-- Storage bucket will be named: booking-documents
-- Settings:
-- - Private bucket (not public)
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/jpg, image/png, application/pdf

-- Create storage policy for authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'booking-documents');

-- Create policy for users to read their own documents
CREATE POLICY "Allow users to read own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'booking-documents');

-- Create policy for service role to manage all documents
CREATE POLICY "Service role can manage all documents"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'booking-documents');
