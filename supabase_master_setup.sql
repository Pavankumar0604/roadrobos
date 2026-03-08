-- =====================================================================
--  RoadRobos — ULTIMATE MASTER SUPABASE SCHEMA (v3 — Error-Free)
--  Consolidated schema covering Booking, Service Hub, CMS, and Auth.
--  Fully debugged: Fixes PGRST200, 42P17, Auth Triggers, and Constraints.
-- =====================================================================

-- 0. EXTENSIONS & PURGING OLD RULES
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Aggressively purge ALL Row-Level Security Policies across the database 
-- to definitively clear infinite recursion loop errors (42P17).
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 1. USERS & ADMINS
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT,    -- Renamed to fix Auth Trigger crashes and frontend API fetches
    email       TEXT UNIQUE,
    phone       TEXT,
    role        TEXT DEFAULT 'user', -- 'user', 'admin', 'employee'
    avatar_url  TEXT,
    last_login  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Upgrade existing 'name' column to 'full_name' silently if the old schema runs
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='users' AND column_name='name') THEN
    ALTER TABLE public.users RENAME COLUMN name TO full_name;
  END IF;
END $$;


-- Re-create admin_users table with the correct constraint text
CREATE TABLE IF NOT EXISTS public.admin_users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    role       TEXT NOT NULL DEFAULT 'manager',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Force old roles into compliance then apply strict constraints mapping front-end Role IDs
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
UPDATE public.admin_users 
SET role = 'manager' 
WHERE role NOT IN ('super_admin', 'manager', 'staff', 'service_manager', 'generalmanager', 'servicemanager', 'content_editor');

ALTER TABLE public.admin_users 
ADD CONSTRAINT admin_users_role_check 
CHECK (role IN ('super_admin', 'manager', 'staff', 'service_manager', 'generalmanager', 'servicemanager', 'content_editor'));


-- ─────────────────────────────────────────────────────────────────
-- 2. BIKES & INVENTORY
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bikes (
    id                 SERIAL PRIMARY KEY,
    name               TEXT NOT NULL,
    type               TEXT NOT NULL DEFAULT 'Electric',
    availability       TEXT NOT NULL DEFAULT 'Available',
    cc                 TEXT,
    transmission       TEXT DEFAULT 'Automatic',
    deposit            NUMERIC DEFAULT 0,
    price_hour         NUMERIC DEFAULT 0,
    price_day          NUMERIC DEFAULT 0,
    price_week         NUMERIC DEFAULT 0,
    price_month        NUMERIC DEFAULT 0,
    price_quarterly    NUMERIC DEFAULT 0,
    price_yearly       NUMERIC DEFAULT 0,
    total_stock        INTEGER DEFAULT 1,
    booked_count       INTEGER DEFAULT 0,
    available_count    INTEGER DEFAULT 1,
    km_limit_hour      NUMERIC DEFAULT 0,
    km_limit_day       NUMERIC DEFAULT 0,
    km_limit_week      NUMERIC DEFAULT 0,
    km_limit_month     NUMERIC DEFAULT 0,
    excess_km_charge   NUMERIC DEFAULT 0,
    min_booking_hour   NUMERIC DEFAULT 1,
    min_booking_day    NUMERIC DEFAULT 1,
    service_status     TEXT DEFAULT 'none' CHECK (service_status IN ('none', 'pending', 'in_progress', 'completed')),
    current_status     TEXT DEFAULT 'readyRent',
    checks             JSONB DEFAULT '{}'::jsonb,
    assigned_tech      TEXT,
    spare_parts        JSONB DEFAULT '[]'::jsonb,
    parts_report       TEXT,
    created_at         TIMESTAMPTZ DEFAULT now(),
    updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bike_images (
    id            SERIAL PRIMARY KEY,
    bike_id       INTEGER NOT NULL REFERENCES public.bikes(id) ON DELETE CASCADE,
    image_url     TEXT NOT NULL,
    display_order INTEGER DEFAULT 1,
    is_primary    BOOLEAN DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bike_color_variants (
    id         SERIAL PRIMARY KEY,
    bike_id    INTEGER NOT NULL REFERENCES public.bikes(id) ON DELETE CASCADE,
    color_name TEXT NOT NULL,
    image_url  TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bike_units (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bike_id             BIGINT REFERENCES public.bikes(id) ON DELETE CASCADE,
    unit_number         TEXT UNIQUE NOT NULL,  
    color_name          TEXT,
    registration_number TEXT,
    chassis_number      TEXT,
    status              TEXT DEFAULT 'Ready' CHECK (status IN ('Ready', 'In Service', 'Rented')),
    service_status      TEXT DEFAULT 'none' CHECK (service_status IN ('none', 'pending', 'in_progress', 'completed')),
    checks              JSONB DEFAULT '{}'::jsonb,
    assigned_tech       TEXT,
    spare_parts         JSONB DEFAULT '[]'::jsonb,
    parts_report        TEXT,
    last_service_km     NUMERIC DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 3. RIDER INFORMATION (KYC)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rider_information (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name            TEXT NOT NULL,
    contact_number       TEXT,
    alternate_number     TEXT,
    email_id             TEXT,
    dl_number            TEXT,
    aadhaar_number       TEXT,
    pan_number           TEXT,
    aadhaar_document_url TEXT,
    pan_document_url     TEXT,
    local_address        TEXT,
    permanent_address    TEXT,
    delivery_executive   BOOLEAN DEFAULT false,
    delivery_id          TEXT,
    created_at           TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 4. BOOKINGS & TRANSACTIONS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id       TEXT UNIQUE,
    user_id          UUID REFERENCES public.users(id) ON DELETE SET NULL,
    rider_info_id    UUID REFERENCES public.rider_information(id) ON DELETE SET NULL,
    bike_id          INTEGER REFERENCES public.bikes(id) ON DELETE SET NULL,
    user_name        TEXT,
    user_email       TEXT,
    user_phone       TEXT,
    rider_name       TEXT,
    vehicle_name     TEXT,
    pickup_location  TEXT,
    pickup_date      TEXT,
    pickup_time      TEXT,
    drop_date        TEXT,
    drop_time        TEXT,
    total_fare       NUMERIC DEFAULT 0,
    total_payable    NUMERIC DEFAULT 0,
    payment_mode     TEXT DEFAULT 'CASH',
    payment_status   TEXT DEFAULT 'Pending',
    status           TEXT DEFAULT 'Active',
    transaction_id   TEXT,
    created_at       TIMESTAMPTZ DEFAULT now(),
    updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id      TEXT UNIQUE,
    booking_id          TEXT,  
    user_id             UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name       TEXT DEFAULT 'Guest',
    amount              NUMERIC NOT NULL DEFAULT 0,
    currency            TEXT DEFAULT 'INR',
    status              TEXT NOT NULL DEFAULT 'Pending',
    payment_mode        TEXT DEFAULT 'CASH',
    razorpay_order_id   TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature  TEXT,
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Force add missing user_id if this is an older database
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────────────
-- 5. OFFICE & CMS
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.offers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT NOT NULL,
    type                TEXT,
    code                TEXT UNIQUE,
    discount_percent    NUMERIC DEFAULT 0,
    flat_amount         NUMERIC DEFAULT 0,
    validity_date       TEXT,
    applicable_cities   TEXT[] DEFAULT '{}',
    min_booking         NUMERIC DEFAULT 0,
    image_placeholder   TEXT,
    description_bullets TEXT[] DEFAULT '{}',
    auto_applied        BOOLEAN DEFAULT false,
    ends_in             INTEGER,
    status              TEXT DEFAULT 'Active',
    usage_limit_per_user INTEGER DEFAULT 1,
    total_uses          INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS auto_applied BOOLEAN DEFAULT false;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS ends_in INTEGER;

CREATE TABLE IF NOT EXISTS public.enquiries (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    email        TEXT,
    phone        TEXT,
    message      TEXT,
    city         TEXT,
    status       TEXT DEFAULT 'New',
    created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS city TEXT;

CREATE TABLE IF NOT EXISTS public.reviews (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name         TEXT NOT NULL,
    rating       SMALLINT DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    text         TEXT,
    status       TEXT DEFAULT 'Pending',
    created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.pickup_locations (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    address    TEXT,
    city       TEXT,
    status     TEXT DEFAULT 'active',
    is_active  BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pickup_locations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE TABLE IF NOT EXISTS public.employees (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    role        TEXT,
    email       TEXT,
    phone       TEXT,
    status      TEXT DEFAULT 'Active',
    joined_at   TEXT,
    specialty   TEXT DEFAULT 'General',
    tasks       INTEGER DEFAULT 0,
    avatar      TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_name TEXT NOT NULL,
    email          TEXT,
    phone          TEXT,
    position       TEXT,
    resume_url     TEXT,
    status         TEXT DEFAULT 'Pending',
    applied_date   TIMESTAMPTZ DEFAULT now(),
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_content (
    id         INTEGER PRIMARY KEY DEFAULT 1,
    content    JSONB DEFAULT '{}'::jsonb,
    hero_headline TEXT,
    hero_tagline TEXT,
    about_text  TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    footer_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_logs (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bike_id        INTEGER REFERENCES public.bikes(id) ON DELETE CASCADE,
    service_type   TEXT NOT NULL,
    description    TEXT,
    parts_replaced TEXT[] DEFAULT '{}',
    cost           NUMERIC DEFAULT 0,
    technician     TEXT,
    completed_at   TIMESTAMPTZ DEFAULT now(),
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.parts_inventory (
    sr_no             INTEGER PRIMARY KEY,
    name              TEXT NOT NULL,
    price             NUMERIC NOT NULL DEFAULT 0,
    category          TEXT NOT NULL,
    stock_current     INTEGER DEFAULT 0,
    stock_min         INTEGER DEFAULT 0,
    stock_max         INTEGER DEFAULT 100,
    high_value        BOOLEAN DEFAULT false,
    last_ordered      TEXT,
    compatible_models TEXT[] DEFAULT '{}',
    created_at        TIMESTAMPTZ DEFAULT now(),
    updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────
-- 6. FUNCTIONS, TRIGGERS & RPCs (BUGFIXES APPLIED)
-- ─────────────────────────────────────────────────────────────────

-- Admin Check Function (SECURITY DEFINER to prevent recursion blocks)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
END;
$$;

-- Secure Admin Creation RPC (Bypasses Frontend Insert Locks Securely)
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid, target_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Verify the calling user is already an admin
    IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()) THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can assign roles.';
    END IF;
    
    INSERT INTO public.admin_users (user_id, role)
    VALUES (target_user_id, target_role);
END;
$$;


-- GoTrue Auth Signup Crash Fix: Now maps raw user metadata directly into `full_name` 
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.users (id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Bike Stock Sync Trigger
CREATE OR REPLACE FUNCTION sync_bike_available_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.available_count := NEW.total_stock - NEW.booked_count;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_bike_available_count ON public.bikes;
CREATE TRIGGER trg_sync_bike_available_count
    BEFORE INSERT OR UPDATE ON public.bikes
    FOR EACH ROW EXECUTE FUNCTION sync_bike_available_count();


-- ─────────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY (SAFE MODE NO RECURSION)
-- ─────────────────────────────────────────────────────────────────

-- Enable RLS deeply across everything
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_images        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_color_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bike_units         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rider_information  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_locations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_inventory    ENABLE ROW LEVEL SECURITY;

-- GLOBAL READ: Public data readable by anyone
CREATE POLICY "Read Bikes"      ON public.bikes              FOR SELECT USING (true);
CREATE POLICY "Read Images"     ON public.bike_images        FOR SELECT USING (true);
CREATE POLICY "Read Colors"     ON public.bike_color_variants FOR SELECT USING (true);
CREATE POLICY "Read Units"      ON public.bike_units         FOR SELECT USING (true);
CREATE POLICY "Read Offers"     ON public.offers             FOR SELECT USING (true);
CREATE POLICY "Read Reviews"    ON public.reviews            FOR SELECT USING (status = 'Approved');
CREATE POLICY "Read Locations"  ON public.pickup_locations   FOR SELECT USING (true);
CREATE POLICY "Read Site"       ON public.site_content       FOR SELECT USING (true);
CREATE POLICY "Read Parts"      ON public.parts_inventory    FOR SELECT USING (true);
CREATE POLICY "Read Employees"  ON public.employees          FOR SELECT USING (true);

-- API FORMS: Anyone can submit
CREATE POLICY "Submit Enquiries" ON public.enquiries          FOR INSERT WITH CHECK (true);
CREATE POLICY "Submit Reviews"   ON public.reviews            FOR INSERT WITH CHECK (true);
CREATE POLICY "Submit Job Apps"  ON public.job_applications   FOR INSERT WITH CHECK (true);

-- AUTH USERS: Users explicitly Read/Write their own private data
CREATE POLICY "Global Users Read"           ON public.users              FOR SELECT USING (true); 
CREATE POLICY "Users Manage Own Data"       ON public.users              FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users Manage Own Rider Info" ON public.rider_information  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users View Own Bookings"     ON public.bookings           FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users Connect Active Books"  ON public.bookings           FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users View Own TX"           ON public.transactions       FOR SELECT USING (auth.uid() = user_id);

-- ADMIN GLOBAL (Uses is_admin safely)
CREATE POLICY "Admin Global Readers" ON public.admin_users        FOR SELECT USING (true);
CREATE POLICY "Admin Bikes"          ON public.bikes              FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Bookings"       ON public.bookings           FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Transactions"   ON public.transactions       FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Offers"         ON public.offers             FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Enquiries"      ON public.enquiries          FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Reviews"        ON public.reviews            FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Employees"      ON public.employees          FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Site Content"   ON public.site_content       FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Job Apps"       ON public.job_applications   FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Units"          ON public.bike_units         FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Parts"          ON public.parts_inventory    FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Service Logs"   ON public.service_logs       FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Images"         ON public.bike_images        FOR ALL USING (public.is_admin());
CREATE POLICY "Admin Colors"         ON public.bike_color_variants FOR ALL USING (public.is_admin());

-- ─────────────────────────────────────────────────────────────────
-- 8. COMPILER INSTRUCTIONS
-- ─────────────────────────────────────────────────────────────────
-- Fix PostgREST API schema cache lockouts 
NOTIFY pgrst, 'reload schema';
