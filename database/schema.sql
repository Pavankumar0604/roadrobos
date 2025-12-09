-- RoAd RoBo's Bike Rentals - MySQL Database Schema
-- Compatible with cPanel MySQL and Supabase

-- Create Database (Run this first if needed)
-- CREATE DATABASE IF NOT EXISTS roadrobos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE roadrobos_db;

-- ============================================================================
-- 1. USERS & AUTHENTICATION (Managed by Supabase Auth)
-- ============================================================================

-- Users table (synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(20),
    alternate_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin users with roles
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    role ENUM('Super Admin', 'Content Editor', 'Support Staff') NOT NULL,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. BIKES & INVENTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS bikes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Scooter', 'Fuel', 'Electric', 'Superbike') NOT NULL,
    cc VARCHAR(50),
    transmission VARCHAR(50),
    price_hour DECIMAL(10, 2) NOT NULL,
    price_day DECIMAL(10, 2) NOT NULL,
    price_week DECIMAL(10, 2) NOT NULL,
    price_month DECIMAL(10, 2) NOT NULL,
    min_booking_hour INT DEFAULT 1,
    min_booking_day INT DEFAULT 1,
    km_limit_hour INT,
    km_limit_day INT,
    km_limit_week INT,
    km_limit_month INT,
    excess_km_charge DECIMAL(10, 2),
    deposit DECIMAL(10, 2) NOT NULL,
    availability ENUM('Available', 'Limited', 'Coming Soon') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_availability (availability)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bike images
CREATE TABLE IF NOT EXISTS bike_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bike_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE,
    INDEX idx_bike_id (bike_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bike color variants
CREATE TABLE IF NOT EXISTS bike_color_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bike_id INT NOT NULL,
    color_name VARCHAR(100) NOT NULL,
    image_index INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bike_id) REFERENCES bikes(id) ON DELETE CASCADE,
    INDEX idx_bike_id (bike_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. RIDER INFORMATION & DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS rider_information (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    id_proof ENUM('Aadhaar Card', 'PAN Card') NOT NULL,
    id_number VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    alternate_number VARCHAR(20),
    email_id VARCHAR(255) NOT NULL,
    local_address TEXT NOT NULL,
    local_address_proof VARCHAR(500),
    permanent_address TEXT NOT NULL,
    permanent_address_proof VARCHAR(500),
    delivery_executive BOOLEAN DEFAULT FALSE,
    delivery_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_application_number (application_number),
    INDEX idx_contact_number (contact_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. BOOKINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rider_info_id INT NOT NULL,
    bike_id INT NOT NULL,
    
    -- Pickup/Drop Details
    pickup_location VARCHAR(255) NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    drop_date DATE NOT NULL,
    drop_time TIME NOT NULL,
    city VARCHAR(100) NOT NULL,
    
    -- Vehicle Details
    vehicle_name VARCHAR(255) NOT NULL,
    vehicle_type VARCHAR(100),
    vehicle_category VARCHAR(100),
    vehicle_color VARCHAR(100),
    vehicle_id_number VARCHAR(100),
    
    -- Rental Period
    rental_commencement_date DATE NOT NULL,
    started_date DATE,
    return_date DATE,
    
    -- Pricing
    total_fare DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Add-ons
    helmet_addon BOOLEAN DEFAULT FALSE,
    insurance_addon BOOLEAN DEFAULT FALSE,
    
    -- Status
    status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    
    -- Payment
    transaction_id VARCHAR(100),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rider_info_id) REFERENCES rider_information(id) ON DELETE CASCADE,
    FOREIGN KEY (bike_id) REFERENCES bikes(id),
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_pickup_date (pickup_date),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. TRANSACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    booking_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(500),
    status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_booking_id (booking_id),
    INDEX idx_status (status),
    INDEX idx_transaction_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. OFFERS & PROMOTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS offers (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type ENUM('app', 'first', 'seasonal', 'referral', 'corporate') NOT NULL,
    code VARCHAR(50),
    discount_percent INT,
    flat_amount DECIMAL(10, 2),
    validity_date DATE NOT NULL,
    applicable_cities JSON,
    min_booking VARCHAR(100),
    image_placeholder VARCHAR(500),
    description_bullets JSON,
    ends_in INT,
    auto_applied BOOLEAN DEFAULT FALSE,
    status ENUM('Active', 'Disabled') DEFAULT 'Active',
    usage_limit_per_user INT DEFAULT 1,
    total_uses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_validity (validity_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Offer usage tracking
CREATE TABLE IF NOT EXISTS offer_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    booking_id VARCHAR(50),
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_offer (user_id, offer_id),
    INDEX idx_offer_id (offer_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. REVIEWS & RATINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    booking_id VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_status (status),
    INDEX idx_rating (rating),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. PARTNER APPLICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS partner_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partnership_type ENUM('Fleet Owner', 'Dealer', 'Service Center', 'Corporate', 'Other') NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    locality VARCHAR(255),
    fleet_size INT,
    vehicle_scooter BOOLEAN DEFAULT FALSE,
    vehicle_geared BOOLEAN DEFAULT FALSE,
    vehicle_electric BOOLEAN DEFAULT FALSE,
    contact_method ENUM('Phone', 'Email') DEFAULT 'Phone',
    message TEXT,
    status ENUM('New', 'Contacted', 'In Discussion', 'Approved', 'Rejected') DEFAULT 'New',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_partnership_type (partnership_type),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. ENQUIRIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS enquiries (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100),
    message TEXT NOT NULL,
    status ENUM('New', 'Read', 'Archived') DEFAULT 'New',
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_received_at (received_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. EMPLOYEES
-- ============================================================================

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('Operations', 'Support', 'Marketing', 'Tech') NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 11. JOBS & APPLICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS job_openings (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type ENUM('Full-time', 'Part-time', 'Internship') NOT NULL,
    department ENUM('Operations', 'Tech', 'Marketing', 'Support') NOT NULL,
    description TEXT,
    requirements TEXT,
    status ENUM('Open', 'Closed') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_applications (
    id VARCHAR(36) PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(20) NOT NULL,
    resume_file_name VARCHAR(255),
    resume_file_url VARCHAR(500),
    cover_letter TEXT,
    status ENUM('New', 'Under Review', 'Interviewing', 'Rejected', 'Hired') DEFAULT 'New',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES job_openings(id) ON DELETE CASCADE,
    
    INDEX idx_job_id (job_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 12. PRESS & MEDIA
-- ============================================================================

CREATE TABLE IF NOT EXISTS press_releases (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    link VARCHAR(500),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 13. SITE CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS site_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(100) NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_section_key (section, key_name),
    INDEX idx_section (section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 14. CITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 15. FAQ
-- ============================================================================

CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('General', 'Booking', 'Payment', 'Partner') DEFAULT 'General',
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 16. AUDIT LOG (For tracking changes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
