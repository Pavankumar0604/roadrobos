// @ts-nocheck
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('./config.cjs');
const { v4: uuidv4 } = require('uuid');

// Get pool instance
const pool = getPool();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'roadrobos-super-secret-jwt-key-change-this-in-production-2025';
const JWT_EXPIRES_IN = '7d';

async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

function generateToken(userId, email) {
    return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

async function signUp(email, password, userData = {}) {
    try {
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return { success: false, error: 'User exists' };

        const passwordHash = await hashPassword(password);
        const userId = uuidv4();

        await pool.execute(
            `INSERT INTO users (id, email, password_hash, name, phone, status, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
            [userId, email, passwordHash, userData.name || null, userData.phone || null]
        );

        const token = generateToken(userId, email);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await pool.execute(
            'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
            [userId, token, expiresAt]
        );

        return { success: true, user: { id: userId, email, name: userData.name }, token };
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, error: 'Signup failed: ' + error.message };
    }
}

async function signIn(email, password) {
    try {
        const [users] = await pool.execute(
            'SELECT id, email, password_hash, name, status FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) return { success: false, error: 'Invalid email or password' };
        const user = users[0];

        if (user.status !== 'active') return { success: false, error: 'Account suspended' };

        const isValid = await comparePassword(password, user.password_hash);
        if (!isValid) return { success: false, error: 'Invalid email or password' };

        const token = generateToken(user.id, user.email);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await pool.execute(
            'INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt]
        );

        await pool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        return {
            success: true,
            user: { id: user.id, email: user.email, name: user.name },
            token
        };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: 'DB Error: ' + error.message };
    }
}

async function signOut(token) {
    try {
        await pool.execute('DELETE FROM user_sessions WHERE token = ?', [token]);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Sign out failed' };
    }
}

async function verifyUserToken(token) {
    try {
        const decoded = verifyToken(token);
        if (!decoded) return { success: false, error: 'Invalid token' };

        const [sessions] = await pool.execute(
            'SELECT user_id FROM user_sessions WHERE token = ? AND expires_at > NOW()',
            [token]
        );
        if (sessions.length === 0) return { success: false, error: 'Session expired' };

        const [users] = await pool.execute(
            'SELECT id, email, name, phone, status FROM users WHERE id = ?',
            [decoded.userId]
        );
        if (users.length === 0) return { success: false, error: 'User not found' };

        return { success: true, user: users[0] };
    } catch (error) {
        return { success: false, error: 'Verification failed' };
    }
}

async function resetPassword(email) {
    // Placeholder for password reset logic
    return { success: true, message: 'Reset link sent' };
}

async function isAdmin(userId) {
    try {
        const [admins] = await pool.execute('SELECT role FROM admin_users WHERE user_id = ?', [userId]);
        return admins.length > 0;
    } catch (error) {
        return false;
    }
}

module.exports = { signUp, signIn, signOut, verifyUserToken, resetPassword, isAdmin, hashPassword };
