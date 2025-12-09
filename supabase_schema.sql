-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. USERS & AUTH
-- ============================================================================

-- Public Users table (synced with auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  phone text,
  alternate_phone text,
  avatar_url text,
  role text default 'user', -- 'user', 'admin', 'employee'
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Policies
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Trigger to create public.users on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, phone)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Admin Users (Roles)
create table public.admin_users (
  id serial primary key,
  user_id uuid references public.users(id) on delete cascade unique,
  role text not null, -- 'superAdmin', 'contentEditor', 'support', etc.
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can view admin_users" on public.admin_users
  for select using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );


-- ============================================================================
-- 2. BIKES
-- ============================================================================

create table public.bikes (
  id serial primary key,
  name text not null,
  type text not null, -- 'Scooter', 'Electric', 'Gear', 'Superbike'
  cc text,
  transmission text,
  price_hour integer,
  price_day integer,
  price_week integer,
  price_month integer,
  price_quarterly integer,
  price_yearly integer,
  min_booking_hour integer default 10,
  min_booking_day integer default 1,
  km_limit_hour integer,
  km_limit_day integer,
  km_limit_week integer,
  km_limit_month integer,
  excess_km_charge integer,
  deposit integer,
  availability text default 'Available',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bikes enable row level security;

-- Public read access
create policy "Public can view bikes" on public.bikes
  for select using (true);

-- Admin write access (simplified: if in admin_users, allow all)
create policy "Admins can insert bikes" on public.bikes
  for insert with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can update bikes" on public.bikes
  for update using (exists (select 1 from public.admin_users where user_id = auth.uid()));

create policy "Admins can delete bikes" on public.bikes
  for delete using (exists (select 1 from public.admin_users where user_id = auth.uid()));


-- Bike Images
create table public.bike_images (
  id serial primary key,
  bike_id integer references public.bikes(id) on delete cascade,
  image_url text not null,
  display_order integer default 0,
  is_primary boolean default false
);

alter table public.bike_images enable row level security;
create policy "Public can view bike images" on public.bike_images for select using (true);


-- Bike Color Variants
create table public.bike_color_variants (
  id serial primary key,
  bike_id integer references public.bikes(id) on delete cascade,
  color_name text,
  image_url text
);

alter table public.bike_color_variants enable row level security;
create policy "Public can view bike colors" on public.bike_color_variants for select using (true);


-- ============================================================================
-- 3. RIDER INFO & BOOKINGS
-- ============================================================================

create table public.rider_information (
  id serial primary key,
  user_id uuid references public.users(id),
  application_number text,
  user_name text,
  id_proof text,
  id_number text,
  contact_number text,
  alternate_number text,
  email_id text,
  local_address text,
  local_address_proof text, -- URL
  permanent_address text,
  permanent_address_proof text, -- URL
  delivery_executive boolean default false,
  delivery_id text,
  created_at timestamptz default now()
);

alter table public.rider_information enable row level security;

create policy "Users can view own rider info" on public.rider_information
  for select using (auth.uid() = user_id);
create policy "Users can insert own rider info" on public.rider_information
  for insert with check (auth.uid() = user_id);


create table public.bookings (
  id serial primary key,
  booking_id text unique not null,
  user_id uuid references public.users(id),
  rider_info_id integer references public.rider_information(id),
  bike_id integer references public.bikes(id),
  
  pickup_location text,
  pickup_date date,
  pickup_time text,
  drop_date date,
  drop_time text,
  city text,
  
  vehicle_name text,
  vehicle_type text,
  vehicle_category text,
  vehicle_color text,
  vehicle_id_number text,
  
  rental_commencement_date text,
  total_fare numeric,
  deposit_amount numeric default 0,
  
  helmet_addon boolean default false,
  insurance_addon boolean default false,
  
  payment_mode text, -- 'online', 'cash'
  base_fare numeric,
  platform_fee numeric,
  total_payable numeric,
  
  status text default 'pending', -- 'pending', 'confirmed', 'active', 'completed', 'cancelled'
  payment_status text default 'PENDING',
  transaction_id text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bookings enable row level security;

create policy "Users can view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

create policy "Users can insert own bookings" on public.bookings
  for insert with check (auth.uid() = user_id OR user_id is null); -- Allow guest bookings if logic supports it, otherwise strict

-- ============================================================================
-- 4. TRANSACTIONS
-- ============================================================================

create table public.transactions (
  id serial primary key,
  transaction_id text unique not null,
  booking_id text references public.bookings(booking_id),
  user_id uuid references public.users(id),
  customer_name text,
  amount numeric,
  currency text default 'INR',
  payment_method text,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);


-- ============================================================================
-- 5. OTHER TABLES (Offers, Enquiries, etc.)
-- ============================================================================

create table public.offers (
  id text primary key, -- 'o1', 'o2' etc from constants
  title text,
  code text,
  discount_percent numeric,
  flat_amount numeric,
  validity_date text,
  applicable_cities text[],
  min_booking text,
  image_placeholder text,
  description_bullets text[],
  ends_in integer,
  status text default 'Active',
  usage_limit_per_user integer,
  total_uses integer default 0,
  type text,
  created_at timestamptz default now()
);

alter table public.offers enable row level security;
create policy "Public can view offers" on public.offers for select using (true);


create table public.enquiries (
  id serial primary key, -- 'enq1' logic in frontend might need update to match serial or uuid
  name text,
  email text,
  phone text,
  message text,
  city text,
  status text default 'New',
  received_at timestamptz default now()
);
alter table public.enquiries enable row level security;
create policy "Public can create enquiries" on public.enquiries for insert with check (true);


create table public.reviews (
  id serial primary key,
  user_id uuid references public.users(id),
  name text,
  rating integer,
  text text,
  status text default 'Pending',
  created_at timestamptz default now()
);
alter table public.reviews enable row level security;
create policy "Public can view approved reviews" on public.reviews for select using (status = 'Approved');
create policy "Users can create reviews" on public.reviews for insert with check (auth.role() = 'authenticated');


create table public.locations (
  name text primary key
);
alter table public.locations enable row level security;
create policy "Public can view locations" on public.locations for select using (true);


create table public.employees (
  id serial primary key,
  name text,
  email text,
  role text,
  status text,
  created_at timestamptz default now()
);
alter table public.employees enable row level security;


create table public.applications (
  id serial primary key,
  job_id text,
  applicant_name text,
  applicant_email text,
  applicant_phone text,
  resume_file_name text,
  resume_file_url text, -- Store URL instead of base64 if possible, but schema allows text
  status text default 'New',
  submitted_at timestamptz default now()
);
alter table public.applications enable row level security;
create policy "Public can create applications" on public.applications for insert with check (true);


create table public.site_content (
  id integer primary key,
  content jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.site_content enable row level security;
create policy "Public can view site content" on public.site_content for select using (true);

-- Insert initial site content
insert into public.site_content (id, content) 
values (1, '{"home": {"heroTitleTemplate": "Rent Bikes in [city] — From ₹35/hr", "heroSubtitle": "Hourly, daily & monthly rentals. Doorstep pickup, verified bikes & optional insurance."}, "contact": {"email": "chris@roadrobos.com", "phone": "+91-9844991225"}}'::jsonb);
