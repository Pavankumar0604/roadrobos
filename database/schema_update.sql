-- Offers Table
CREATE TABLE IF NOT EXISTS offers (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    discount_percent INT NOT NULL,
    description VARCHAR(255),
    expiry_date DATETIME,
    status ENUM('Active', 'Disabled', 'Expired') DEFAULT 'Active',
    min_booking_duration INT DEFAULT 0,
    max_discount_amount INT DEFAULT 0,
    applicable_cities JSON,
    image_placeholder VARCHAR(255),
    description_bullets JSON,
    terms_conditions JSON,
    total_uses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT,
    status ENUM('New', 'Read', 'Replied') DEFAULT 'New',
    date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    bike_id INT,
    user_avatar VARCHAR(255)
);

-- Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    phone VARCHAR(20),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(50) PRIMARY KEY,
    applicant_name VARCHAR(100) NOT NULL,
    applicant_email VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    status ENUM('New', 'Under Review', 'Interviewing', 'Hired', 'Rejected') DEFAULT 'New',
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resume_url VARCHAR(255),
    cover_letter TEXT
);

-- Site Content Table
CREATE TABLE IF NOT EXISTS site_content (
    id INT PRIMARY KEY DEFAULT 1,
    content JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default site content if not exists
INSERT IGNORE INTO site_content (id, content)
VALUES (1, '{"home": {"heroTitleTemplate": "Rent the Best Bikes in [city]", "heroSubtitle": "Affordable and convenient bike rentals."}, "contact": {"email": "support@roadrobos.com", "phone": "+91 98765 43210"}}');

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Optional: Make 'admin@roadrobos.com' an admin if they exist
-- You can change the email to your own email address
INSERT IGNORE INTO admin_users (id, user_id, role)
SELECT 'admin_1', id, 'Super Admin' FROM users WHERE email = 'admin@roadrobos.com';
