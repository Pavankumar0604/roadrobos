# RoAd RoBo’s - Application Architecture & Supabase Integration

This document outlines the technical architecture, application flow, and backend integration strategy for the RoAd RoBo’s bike rental platform. The architecture is designed for rapid development, scalability, and security, leveraging a modern Jamstack approach.

---

## 1. High-Level Architecture

The application is built using a decoupled architecture, separating the frontend presentation layer from the backend data and logic layer.

-   **Frontend:** A **React Single-Page Application (SPA)** built with TypeScript.
    -   **Hosting:** The built static assets (HTML, CSS, JS) are hosted on a standard web host like **cPanel**, Vercel, or Netlify. This is cost-effective and provides excellent performance via global CDNs.
-   **Backend:** **Supabase (Backend-as-a-Service)**.
    -   **Database:** Supabase provides a powerful **Postgres** database, which will be our single source of truth.
    -   **Authentication:** Supabase Auth handles user and administrator authentication securely.
    -   **Storage:** Supabase Storage is used for handling file uploads, such as user documents (e.g., Driving Licenses).
    -   **APIs:** Supabase provides instant, secure, and auto-generated RESTful and real-time APIs for interacting with the database directly from the frontend.

### Why this architecture?

-   **Development Speed:** By using Supabase, we eliminate the need to build and maintain a separate backend server. We can focus almost entirely on building a high-quality user experience on the frontend.
-   **Scalability:** Supabase is built to scale automatically. We don't need to manage database servers or server load.
-   **Security:** With Postgres's Row Level Security (RLS), we can define granular data access rules directly in the database, ensuring that users can only access the data they are permitted to see, even when calling the database from the client-side.

---

## 2. Application Flow

### User Booking Journey

1.  **Landing & Search:** A user arrives on the homepage, selects their city, pickup/drop-off location, and date/time.
2.  **View Results:** The app queries Supabase for bikes available in that city and displays the results.
3.  **Bike Details:** The user clicks a bike to see detailed information, pricing, and specifications.
4.  **Booking Process:** The user proceeds to book, enters their personal details (name, email, phone), and uploads a digital copy of their driving license to Supabase Storage.
5.  **Payment:** The user is taken to a payment gateway (simulated in the prototype).
6.  **Confirmation:** Upon successful payment, a new entry is created in the `bookings` table. The user sees a confirmation page with their booking ID.
7.  **Review:** After the trip, the user can submit a review, which is inserted into the `reviews` table with a `pending` status.

### Admin Management Journey

1.  **Login:** An administrator logs in via the dedicated `/login` page using Supabase Auth.
2.  **Dashboard:** The admin is redirected to the dashboard, which provides a high-level overview of business metrics.
3.  **Management:** The admin can navigate through various panels to perform CRUD (Create, Read, Update, Delete) operations on:
    -   **Bikes:** Add new bikes, update pricing, change availability.
    -   **Locations:** Add or remove pickup points.
    -   **Offers:** Create or disable promotional offers.
    -   **Reviews:** Approve or reject user-submitted reviews.
    -   **Enquiries:** View and manage customer messages.

---

## 3. Supabase Database Schema

The following tables will form the core of our Postgres database on Supabase.

| Table Name     | Description                                                                                             | Key Columns                                                                |
| :------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------- |
| `profiles`     | Stores user and admin data. Linked one-to-one with `auth.users`.                                        | `id` (FK to `auth.users`), `full_name`, `email`, `phone`, `role` (e.g., 'admin', 'user') |
| `bikes`        | Master list of all bikes available for rent.                                                            | `id`, `name`, `type`, `specs`, `price_per_day`, `deposit`, `availability_status` |
| `locations`    | List of all active pickup/drop-off locations.                                                           | `id`, `name`, `city`, `address`                                            |
| `bookings`     | Records every rental transaction.                                                                       | `id`, `user_id` (FK to `profiles`), `bike_id` (FK to `bikes`), `start_time`, `end_time`, `total_fare`, `status` |
| `offers`       | Stores promotional codes and discount information.                                                      | `id`, `code`, `discount_percent`, `flat_amount`, `valid_until`, `status`   |
| `reviews`      | Stores customer reviews for bikes.                                                                      | `id`, `user_id` (FK to `profiles`), `bike_id` (FK to `bikes`), `rating`, `text`, `status` ('pending', 'approved', 'rejected') |
| `enquiries`    | Stores messages submitted through the contact form.                                                     | `id`, `name`, `email`, `message`, `status` ('new', 'read')                 |
| `site_content` | Key-value store for editable website text (e.g., hero titles).                                          | `id`, `content_key`, `content_value`                                       |

---

## 4. API Integration & Frontend Interaction

We will use the `@supabase/supabase-js` client library to interact with our backend. All data operations will be performed directly from the React application.

### Initialization

The Supabase client is initialized once with the project URL and anon key.

```javascript
// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Example Frontend Operations

**Fetching available bikes (Public access):**

```javascript
async function getAvailableBikes(city) {
  const { data, error } = await supabase
    .from('bikes')
    .select('*')
    .eq('city', city)
    .neq('availability_status', 'Coming Soon');

  if (error) throw new Error(error.message);
  return data;
}
```

**Creating a new booking (Authenticated users):**

```javascript
async function createBooking(bookingDetails) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be logged in to book.");

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      bike_id: bookingDetails.bike.id,
      start_time: bookingDetails.searchParams.pickupDateTime,
      end_time: bookingDetails.searchParams.dropoffDateTime,
      total_fare: bookingDetails.totalFare,
      status: 'confirmed',
    });

  if (error) throw new Error(error.message);
  return data;
}
```

**Admin updating a bike's price (Admin only):**

```javascript
async function updateBikePrice(bikeId, newPrice) {
  const { data, error } = await supabase
    .from('bikes')
    .update({ price_per_day: newPrice })
    .eq('id', bikeId);

  if (error) throw new Error(error.message);
  return data;
}
```

---

## 5. Row Level Security (RLS) Policies

**RLS is the cornerstone of our security model.** It ensures data is protected at the database level. All tables will have RLS enabled by default, with specific policies created to grant access.

The `auth.uid()` function returns the ID of the currently logged-in user.

### `bikes`, `locations`, `offers` (Public Read, Admin Write)

These tables contain public information. Anyone can view them, but only admins can modify them.

```sql
-- Policy: Enable read access for everyone
CREATE POLICY "Enable public read access"
ON bikes FOR SELECT
USING (true);

-- Policy: Allow admins to perform all actions
CREATE POLICY "Allow full access for admins"
ON bikes FOR ALL
USING (auth.jwt() ->> 'user_role' = 'admin')
WITH CHECK (auth.jwt() ->> 'user_role' = 'admin');

-- (Repeat similar policies for `locations` and `offers`)
```

### `bookings` (User-specific & Admin Access)

Users can create bookings and only view their own. Admins can see all bookings.

```sql
-- Policy: Allow users to create bookings for themselves
CREATE POLICY "Allow users to insert their own bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to view only their own bookings
CREATE POLICY "Allow users to view their own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow admins to view all bookings
CREATE POLICY "Allow admin to view all bookings"
ON bookings FOR SELECT
USING (auth.jwt() ->> 'user_role' = 'admin');
```

### `reviews` (Conditional Public Read, User/Admin Write)

Anyone can see *approved* reviews. Logged-in users can create reviews. Admins manage them.

```sql
-- Policy: Allow public read access for approved reviews
CREATE POLICY "Enable public read for approved reviews"
ON reviews FOR SELECT
USING (status = 'approved');

-- Policy: Allow authenticated users to insert reviews
CREATE POLICY "Allow users to insert reviews"
ON reviews FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow admins to manage all reviews
CREATE POLICY "Allow full access for admins"
ON reviews FOR ALL
USING (auth.jwt() ->> 'user_role' = 'admin');
```

### Supabase Storage (`documents` bucket)

Policies on storage buckets ensure users can only upload and access their own documents.

```sql
-- Policy: Allow users to upload their own documents
CREATE POLICY "Allow users to upload to their own folder"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Allow users to view their own documents
CREATE POLICY "Allow users to view their own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Allow admins full access to all documents
CREATE POLICY "Allow admin full access"
ON storage.objects FOR ALL
USING (bucket_id = 'documents' AND auth.jwt() ->> 'user_role' = 'admin');
```
