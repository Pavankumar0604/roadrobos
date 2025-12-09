# RoAd RoBo's Database Setup Guide

This guide will help you set up MySQL database (cPanel compatible) and Supabase authentication for your bike rental application.

## 📋 Prerequisites

- Node.js installed (v14 or higher)
- MySQL access (local or cPanel)
- Supabase account (free tier available)

---

## 🗄️ Part 1: MySQL Database Setup

### Option A: Local MySQL Setup

1. **Install MySQL** (if not already installed)
   - Windows: Download from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
   - Mac: `brew install mysql`
   - Linux: `sudo apt-get install mysql-server`

2. **Create Database**
   ```bash
   mysql -u root -p
   ```
   Then run:
   ```sql
   CREATE DATABASE roadrobos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Import Schema**
   ```bash
   mysql -u root -p roadrobos_db < database/schema.sql
   ```

### Option B: cPanel MySQL Setup

1. **Login to cPanel**
   - Navigate to your hosting cPanel

2. **Create Database**
   - Go to "MySQL Databases"
   - Create a new database: `roadrobos_db` (note: cPanel will prefix it with your username)
   - Example: `mysite_roadrobos_db`

3. **Create Database User**
   - Still in MySQL Databases
   - Create a new user with a strong password
   - Example username: `mysite_dbuser`

4. **Grant Privileges**
   - Add the user to the database
   - Grant "ALL PRIVILEGES"

5. **Import Schema**
   - Go to "phpMyAdmin" in cPanel
   - Select your database
   - Click "Import" tab
   - Upload `database/schema.sql`
   - Click "Go"

---

## 🔐 Part 2: Supabase Authentication Setup

1. **Create Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up / Sign in
   - Click "New Project"
   - Enter project details:
     - Name: `roadrobos-auth`
     - Database Password: (choose a strong password)
     - Region: Choose closest to your users
   - Click "Create new project"

2. **Get API Keys**
   - Wait for project to initialize (~2 minutes)
   - Go to Settings → API
   - Copy:
     - Project URL (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
     - `anon public` key
     - `service_role secret` key (⚠️ Keep this secret!)

3. **Configure Email Templates** (Optional but recommended)
   - Go to Authentication → Email Templates
   - Customize:
     - Confirm signup
     - Reset password
     - Change email

4. **Configure Auth Settings**
   - Go to Authentication → Settings
   - Set:
     - Site URL: `http://localhost:5173` (dev) or your production URL
     - Redirect URLs: Add your callback URLs

---

## ⚙️ Part 3: Environment Configuration

1. **Update .env file**
   ```bash
   # Copy example file
   cp .env.example .env
   ```

2. **Edit .env** with your actual values:

   ```env
   # Razorpay (existing)
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_secret

   # MySQL Database
   DB_HOST=localhost
   DB_USER=root  # or mysite_dbuser for cPanel
   DB_PASSWORD=your_password
   DB_NAME=roadrobos_db  # or mysite_roadrobos_db for cPanel
   DB_PORT=3306

   # Supabase
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_KEY=your_service_key_here

   # Application
   APP_URL=http://localhost:5173
   NODE_ENV=development
   ```

---

## 📦 Part 4: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Go back to root
cd ..
```

---

## 🚀 Part 5: Start the Application

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```

2. **In a new terminal, start the frontend** (if not already running)
   ```bash
   npm run dev
   ```

3. **Verify everything is working**
   - Open browser to `http://localhost:3000/api/health`
   - You should see:
     ```json
     {
       "status": "ok",
       "database": "connected",
       "timestamp": "2025-11-28T..."
     }
     ```

---

## 📊 Database Tables Created

The schema creates these tables:

### Core Tables
- `users` - User accounts (synced with Supabase)
- `admin_users` - Admin roles and permissions
- `bikes` - Bike inventory
- `bike_images` - Bike photos
- `bike_color_variants` - Color options

### Booking Tables
- `bookings` - Rental bookings
- `rider_information` - Customer details
- `transactions` - Payment records

### Content Tables
- `offers` - Promotional offers
- `reviews` - Customer reviews
- `faqs` - Frequently asked questions
- `cities` - Service locations

### Business Tables
- `partner_applications` - Partnership requests
- `employees` - Staff management
- `job_openings` & `job_applications` - Recruitment
- `press_releases` - Media coverage
- `enquiries` - Customer inquiries

### System Tables
- `site_content` - CMS content
- `audit_log` - Activity tracking

---

## 🔧 Troubleshooting

### Database Connection Failed

**Error**: `ER_ACCESS_DENIED_ERROR`
- Check DB_USER and DB_PASSWORD in .env
- Ensure user has privileges on the database

**Error**: `ER_BAD_DB_ERROR`
- Database doesn't exist - create it first
- Check DB_NAME is correct (including cPanel prefix)

**Error**: `ECONNREFUSED`
- MySQL server not running
- Check DB_HOST and DB_PORT

### Supabase Issues

**Error**: `Invalid API key`
- Check SUPABASE_ANON_KEY in .env
- Ensure you copied the correct key from Supabase dashboard

**Error**: `Failed to fetch`
- Check SUPABASE_URL is correct
- Ensure project is active (not paused)

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `POST /api/auth/reset-password` - Request password reset

### Users
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Bikes
- `GET /api/bikes` - List all bikes
- `GET /api/bikes/:id` - Get bike details

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details

### Payments
- `POST /api/order` - Create payment order
- `POST /api/verify` - Verify payment

### Utilities
- `GET /api/health` - Health check
- `GET /api/generate-application-number` - Generate app number

---

## 📝 Next Steps

1. **Seed Sample Data** (optional)
   - Add sample bikes to database
   - Create test users
   - Add sample FAQs

2. **Configure Production**
   - Update APP_URL in .env
   - Set NODE_ENV=production
   - Enable SSL for Supabase callbacks

3. **Test Authentication Flow**
   - Sign up a test user
   - Verify email confirmation works
   - Test password reset

4. **Test Booking Flow**
   - Create a test booking
   - Process payment
   - Verify database records

---

## 🔒 Security Notes

⚠️ **Important Security Practices:**

1. **Never commit .env to git** - It's in .gitignore
2. **Keep SUPABASE_SERVICE_KEY secret** - Server-side only
3. **Use environment variables in production** - Don't hardcode
4. **Enable Row Level Security (RLS)** in Supabase (advanced)
5. **Use HTTPS in production** - Required for Supabase Auth

---

## 📞 Support

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Check database connection with health endpoint
4. Review Supabase dashboard for auth errors

---

## 🎉 Success!

If everything is set up correctly:
- ✅ Database is connected
- ✅ Supabase auth is working
- ✅ API endpoints respond correctly
- ✅ Frontend can communicate with backend

You're ready to start building! 🚀
