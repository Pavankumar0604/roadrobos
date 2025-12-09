-- Fix for: "infinite recursion detected in policy for relation admin_users"

-- 1. Create a secure function to check admin status
-- SECURITY DEFINER bypasses RLS, preventing the recursion loop
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Good practice for security definer functions
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
END;
$$;

-- 2. Fix admin_users Table Policy (The Source of Recursion)
-- Drop old potential recursive policies
DROP POLICY IF EXISTS "Admins can view all" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view own admin status" ON public.admin_users;

-- Add a simple, non-recursive policy: Users can see their own entry
CREATE POLICY "Users can view own admin status"
ON public.admin_users
FOR SELECT
USING (auth.uid() = user_id);


-- 3. Fix Bikes Table Policies
-- Drop old policies that might be causing the issue
DROP POLICY IF EXISTS "Admins can manage bikes" ON public.bikes;
DROP POLICY IF EXISTS "Admins can insert bikes" ON public.bikes;
DROP POLICY IF EXISTS "Admins can update bikes" ON public.bikes;
DROP POLICY IF EXISTS "Admins can delete bikes" ON public.bikes;

-- Add new policies using the safe is_admin() function
CREATE POLICY "Admins can insert bikes"
ON public.bikes
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update bikes"
ON public.bikes
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete bikes"
ON public.bikes
FOR DELETE
USING (public.is_admin());

-- 4. Apply same fix to other tables if needed (Offers, Enquiries, etc.)
-- Offers
DROP POLICY IF EXISTS "Admins can manage offers" ON public.offers;
CREATE POLICY "Admins can manage offers"
ON public.offers
USING (public.is_admin());

-- Enquiries
DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.enquiries;
CREATE POLICY "Admins can manage enquiries"
ON public.enquiries
USING (public.is_admin());

-- Reviews
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
CREATE POLICY "Admins can manage reviews"
ON public.reviews
USING (public.is_admin());

-- Employees
DROP POLICY IF EXISTS "Admins can manage employees" ON public.employees;
CREATE POLICY "Admins can manage employees"
ON public.employees
USING (public.is_admin());

-- Job Applications
DROP POLICY IF EXISTS "Admins can manage applications" ON public.job_applications;
CREATE POLICY "Admins can manage applications"
ON public.job_applications
USING (public.is_admin());
