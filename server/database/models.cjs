const { query, transaction } = require('./config.cjs');

/**
 * User Model - Synced with Supabase Auth
 */
const User = {
    /**
     * Create or update user (called after Supabase signup)
     */
    async createOrUpdate(userId, email, userData = {}) {
        const sql = `
      INSERT INTO users (id, email, name, phone, alternate_phone, last_login)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        alternate_phone = COALESCE(?, alternate_phone),
        last_login = NOW(),
        updated_at = NOW()
    `;

        return query(sql, [
            userId,
            email,
            userData.name || null,
            userData.phone || null,
            userData.alternate_phone || null,
            userData.name || null,
            userData.phone || null,
            userData.alternate_phone || null
        ]);
    },

    /**
     * Get user by ID
     */
    async getById(userId) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const results = await query(sql, [userId]);
        return results[0];
    },

    /**
     * Get user by email
     */
    async getByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const results = await query(sql, [email]);
        return results[0];
    },

    /**
     * Update user
     */
    async update(userId, updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);

        const sql = `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = ?`;
        return query(sql, [...values, userId]);
    },

    /**
     * Delete user
     */
    async delete(userId) {
        const sql = 'DELETE FROM users WHERE id = ?';
        return query(sql, [userId]);
    },

    /**
     * Update last login
     */
    async updateLastLogin(userId) {
        const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
        return query(sql, [userId]);
    },

    async updatePassword(userId, passwordHash) {
        const sql = 'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?';
        return query(sql, [passwordHash, userId]);
    },

    /**
     * Get count of users
     */
    async count() {
        const result = await query('SELECT COUNT(*) as count FROM users');
        return result[0]?.count || 0;
    }
};

/**
 * Bike Model
 */
const Bike = {
    /**
     * Get all bikes
     */
    async getAll(filters = {}) {
        let sql = 'SELECT * FROM bikes WHERE 1=1';
        const params = [];

        if (filters.type) {
            sql += ' AND type = ?';
            params.push(filters.type);
        }

        if (filters.availability) {
            sql += ' AND availability = ?';
            params.push(filters.availability);
        }

        sql += ' ORDER BY id ASC';
        return query(sql, params);
    },

    /**
     * Get bike by ID
     */
    async getById(bikeId) {
        const sql = 'SELECT * FROM bikes WHERE id = ?';
        const results = await query(sql, [bikeId]);
        return results[0];
    },

    /**
     * Get bike with images
     */
    async getWithImages(bikeId) {
        const bike = await this.getById(bikeId);
        if (!bike) return null;

        const imagesSql = 'SELECT * FROM bike_images WHERE bike_id = ? ORDER BY display_order';
        const images = await query(imagesSql, [bikeId]);

        const colorsSql = 'SELECT * FROM bike_color_variants WHERE bike_id = ?';
        const colors = await query(colorsSql, [bikeId]);

        return {
            ...bike,
            images: images.map(img => img.image_url),
            colorVariants: colors
        };
    },

    /**
     * Create bike
     */
    async create(bikeData) {
        const sql = `
      INSERT INTO bikes (
        name, type, cc, transmission,
        price_hour, price_day, price_week, price_month,
        min_booking_hour, min_booking_day,
        km_limit_hour, km_limit_day, km_limit_week, km_limit_month,
        excess_km_charge, deposit, availability
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const result = await query(sql, [
            bikeData.name,
            bikeData.type,
            bikeData.cc,
            bikeData.transmission,
            bikeData.price_hour,
            bikeData.price_day,
            bikeData.price_week,
            bikeData.price_month,
            bikeData.min_booking_hour || 1,
            bikeData.min_booking_day || 1,
            bikeData.km_limit_hour,
            bikeData.km_limit_day,
            bikeData.km_limit_week,
            bikeData.km_limit_month,
            bikeData.excess_km_charge,
            bikeData.deposit,
            bikeData.availability || 'Available'
        ]);

        return result.insertId;
    },

    /**
     * Add bike image
     */
    async addImage(bikeId, imageUrl, displayOrder = 0, isPrimary = false) {
        const sql = `
      INSERT INTO bike_images (bike_id, image_url, display_order, is_primary)
      VALUES (?, ?, ?, ?)
    `;
        return query(sql, [bikeId, imageUrl, displayOrder, isPrimary]);
    },

    /**
     * Get count of bikes
     */
    async count() {
        const result = await query('SELECT COUNT(*) as count FROM bikes');
        return result[0]?.count || 0;
    },

    /**
     * Get utilization (percentage of bikes booked)
     */
    async getUtilization() {
        const totalResult = await query('SELECT COUNT(*) as count FROM bikes');
        const bookedResult = await query('SELECT COUNT(DISTINCT bike_id) as count FROM bookings WHERE status IN ("confirmed", "active")');

        const total = totalResult[0]?.count || 0;
        const booked = bookedResult[0]?.count || 0;

        return total > 0 ? Math.round((booked / total) * 100) : 0;
    }
};

/**
 * Booking Model
 */
const Booking = {
    /**
     * Create booking
     */
    async create(bookingData) {
        return transaction(async (connection) => {
            // Insert booking
            const bookingSql = `
        INSERT INTO bookings (
          booking_id, user_id, rider_info_id, bike_id,
          pickup_location, pickup_date, pickup_time,
          drop_date, drop_time, city,
          vehicle_name, vehicle_type, vehicle_category, vehicle_color, vehicle_id_number,
          rental_commencement_date, total_fare, deposit_amount,
          helmet_addon, insurance_addon, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const [bookingResult] = await connection.execute(bookingSql, [
                bookingData.booking_id,
                bookingData.user_id,
                bookingData.rider_info_id,
                bookingData.bike_id,
                bookingData.pickup_location,
                bookingData.pickup_date,
                bookingData.pickup_time,
                bookingData.drop_date,
                bookingData.drop_time,
                bookingData.city,
                bookingData.vehicle_name,
                bookingData.vehicle_type,
                bookingData.vehicle_category,
                bookingData.vehicle_color,
                bookingData.vehicle_id_number,
                bookingData.rental_commencement_date,
                bookingData.total_fare,
                bookingData.deposit_amount || 0,
                bookingData.helmet_addon || false,
                bookingData.insurance_addon || false,
                'pending'
            ]);

            return bookingResult.insertId;
        });
    },

    /**
     * Get booking by ID
     */
    async getById(bookingId) {
        const sql = `
      SELECT b.*, u.name as user_name, u.email as user_email,
             bike.name as bike_name, bike.type as bike_type,
             r.user_name as rider_name, r.contact_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN bikes bike ON b.bike_id = bike.id
      LEFT JOIN rider_information r ON b.rider_info_id = r.id
      WHERE b.booking_id = ?
    `;
        const results = await query(sql, [bookingId]);
        return results[0];
    },

    /**
     * Get user bookings
     */
    async getByUserId(userId, limit = 10) {
        const sql = `
      SELECT b.*, bike.name as bike_name, bike.type as bike_type
      FROM bookings b
      JOIN bikes bike ON b.bike_id = bike.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT ?
    `;
        return query(sql, [userId, limit]);
    },

    /**
     * Update booking status
     */
    async updateStatus(bookingId, status) {
        const sql = 'UPDATE bookings SET status = ?, updated_at = NOW() WHERE booking_id = ?';
        return query(sql, [status, bookingId]);
    },

    /**
     * Update payment status
     */
    async updatePaymentStatus(bookingId, paymentStatus, transactionId = null) {
        const sql = `
      UPDATE bookings 
      SET payment_status = ?, transaction_id = ?, updated_at = NOW()
      WHERE booking_id = ?
    `;
        return query(sql, [paymentStatus, transactionId, bookingId]);
    },

    /**
     * Get count of bookings
     */
    async count() {
        const result = await query('SELECT COUNT(*) as count FROM bookings');
        return result[0]?.count || 0;
    }
};

/**
 * Rider Information Model
 */
const RiderInfo = {
    /**
     * Create rider information
     */
    async create(riderData) {
        const sql = `
      INSERT INTO rider_information (
        user_id, application_number, user_name, id_proof, id_number,
        contact_number, alternate_number, email_id,
        local_address, local_address_proof, permanent_address, permanent_address_proof,
        delivery_executive, delivery_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const result = await query(sql, [
            riderData.user_id,
            riderData.application_number,
            riderData.user_name,
            riderData.id_proof,
            riderData.id_number,
            riderData.contact_number,
            riderData.alternate_number || null,
            riderData.email_id,
            riderData.local_address,
            riderData.local_address_proof || null,
            riderData.permanent_address,
            riderData.permanent_address_proof,
            riderData.delivery_executive || false,
            riderData.delivery_id || null
        ]);

        return result.insertId;
    },

    /**
     * Get by application number
     */
    async getByAppNumber(appNumber) {
        const sql = 'SELECT * FROM rider_information WHERE application_number = ?';
        const results = await query(sql, [appNumber]);
        return results[0];
    }
};

/**
 * Transaction Model
 */
const Transaction = {
    /**
     * Create transaction
     */
    async create(transactionData) {
        const sql = `
      INSERT INTO transactions (
        transaction_id, booking_id, user_id, customer_name,
        amount, currency, payment_method,
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        return query(sql, [
            transactionData.transaction_id,
            transactionData.booking_id,
            transactionData.user_id,
            transactionData.customer_name,
            transactionData.amount,
            transactionData.currency || 'INR',
            transactionData.payment_method || 'razorpay',
            transactionData.razorpay_order_id || null,
            transactionData.razorpay_payment_id || null,
            transactionData.razorpay_signature || null,
            transactionData.status || 'pending'
        ]);
    },

    /**
     * Update transaction status
     */
    async updateStatus(transactionId, status, paymentId = null, signature = null) {
        const sql = `
      UPDATE transactions 
      SET status = ?, razorpay_payment_id = COALESCE(?, razorpay_payment_id),
          razorpay_signature = COALESCE(?, razorpay_signature),
          updated_at = NOW()
      WHERE transaction_id = ?
    `;
        return query(sql, [status, paymentId, signature, transactionId]);
    },

    /**
     * Get all transactions
     */
    async getAll() {
        const sql = `
            SELECT t.*, b.booking_id as booking_ref 
            FROM transactions t
            LEFT JOIN bookings b ON t.booking_id = b.booking_id
            ORDER BY t.created_at DESC
        `;
        return query(sql);
    }
};

module.exports = {
    User,
    Bike,
    Booking,
    RiderInfo,
    Transaction,

    /**
     * Offer Model
     */
    Offer: {
        async getAll() {
            return query('SELECT * FROM offers ORDER BY created_at DESC');
        },
        async create(data) {
            const sql = `INSERT INTO offers (id, title, code, discount_percent, flat_amount, status, usage_limit_per_user, total_uses) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            return query(sql, [data.id, data.title, data.code, data.discountPercent, data.flatAmount, data.status, data.usageLimitPerUser, 0]);
        },
        async update(id, data) {
            const sql = `UPDATE offers SET title=?, code=?, discount_percent=?, flat_amount=?, status=?, usage_limit_per_user=? WHERE id=?`;
            return query(sql, [data.title, data.code, data.discountPercent, data.flatAmount, data.status, data.usageLimitPerUser, id]);
        },
        async delete(id) {
            return query('DELETE FROM offers WHERE id = ?', [id]);
        }
    },

    /**
     * Enquiry Model
     */
    Enquiry: {
        async getAll() {
            return query('SELECT * FROM enquiries ORDER BY received_at DESC');
        },
        async create(data) {
            const sql = `INSERT INTO enquiries (id, name, email, phone, message, city, status) VALUES (?, ?, ?, ?, ?, ?, 'New')`;
            return query(sql, [data.id, data.name, data.email, data.phone, data.message, data.city]);
        },
        async updateStatus(id, status) {
            return query('UPDATE enquiries SET status = ? WHERE id = ?', [status, id]);
        },
        async delete(id) {
            return query('DELETE FROM enquiries WHERE id = ?', [id]);
        }
    },

    /**
     * Review Model
     */
    Review: {
        async getAll() {
            return query('SELECT * FROM reviews ORDER BY created_at DESC');
        },
        async create(data) {
            const sql = `INSERT INTO reviews (id, user_id, name, rating, text, status) VALUES (?, ?, ?, ?, ?, 'Pending')`;
            return query(sql, [data.id, data.userId, data.name, data.rating, data.text]);
        },
        async updateStatus(id, status) {
            return query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
        },
        async delete(id) {
            return query('DELETE FROM reviews WHERE id = ?', [id]);
        }
    },

    /**
     * Location Model
     */
    Location: {
        async getAll() {
            const rows = await query('SELECT name FROM locations ORDER BY name ASC');
            return rows.map(r => r.name);
        },
        async create(name) {
            return query('INSERT INTO locations (name) VALUES (?)', [name]);
        },
        async update(oldName, newName) {
            return query('UPDATE locations SET name = ? WHERE name = ?', [newName, oldName]);
        },
        async delete(name) {
            return query('DELETE FROM locations WHERE name = ?', [name]);
        }
    },

    /**
     * Employee Model
     */
    Employee: {
        async getAll() {
            return query('SELECT * FROM employees ORDER BY name ASC');
        },
        async create(data) {
            const sql = `INSERT INTO employees (id, name, email, role, status) VALUES (?, ?, ?, ?, ?)`;
            return query(sql, [data.id, data.name, data.email, data.role, data.status]);
        },
        async update(id, data) {
            const sql = `UPDATE employees SET name=?, email=?, role=?, status=? WHERE id=?`;
            return query(sql, [data.name, data.email, data.role, data.status, id]);
        },
        async delete(id) {
            return query('DELETE FROM employees WHERE id = ?', [id]);
        }
    },

    /**
     * Application Model
     */
    Application: {
        async getAll() {
            return query('SELECT * FROM applications ORDER BY submitted_at DESC');
        },
        async create(data) {
            const sql = `INSERT INTO applications (id, applicant_name, applicant_email, applicant_phone, resume_file_name, status) VALUES (?, ?, ?, ?, ?, 'New')`;
            return query(sql, [data.id, data.applicantName, data.applicantEmail, data.applicantPhone, data.resumeFileName]);
        },
        async updateStatus(id, status) {
            return query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
        }
    },

    /**
     * Site Content Model
     */
    SiteContent: {
        async get() {
            const rows = await query('SELECT content FROM site_content WHERE id = 1');
            return rows[0]?.content || null;
        },
        async update(content) {
            const sql = `INSERT INTO site_content (id, content) VALUES (1, ?) ON DUPLICATE KEY UPDATE content = ?`;
            const jsonContent = JSON.stringify(content);
            return query(sql, [jsonContent, jsonContent]);
        }
    },

    /**
     * Admin User Model
     */
    AdminUser: {
        async getAll() {
            const sql = `
                SELECT au.id, au.user_id, au.role, u.name, u.email 
                FROM admin_users au
                JOIN users u ON au.user_id = u.id
            `;
            return query(sql);
        },

        async getById(adminId) {
            const sql = `
                SELECT au.id, au.user_id, au.role, u.name, u.email 
                FROM admin_users au
                JOIN users u ON au.user_id = u.id
                WHERE au.id = ?
            `;
            const results = await query(sql, [adminId]);
            return results[0];
        },

        async create(userId, role) {
            const sql = 'INSERT INTO admin_users (user_id, role) VALUES (?, ?)';
            return query(sql, [userId, role]);
        },

        async updateRole(adminId, role) {
            const sql = 'UPDATE admin_users SET role = ? WHERE id = ?';
            return query(sql, [role, adminId]);
        },

        async delete(adminId) {
            const sql = 'DELETE FROM admin_users WHERE id = ?';
            return query(sql, [adminId]);
        }
    }
};
