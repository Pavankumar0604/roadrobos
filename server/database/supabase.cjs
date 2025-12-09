const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create Supabase client for user operations
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Create Supabase admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Authentication Helper Functions

/**
 * Sign up a new user
 */
const signUp = async (email, password, metadata = {}) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });

        if (error) throw error;
        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sign in an existing user
 */
const signIn = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sign out current user
 */
const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get current session
 */
const getSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    } catch (error) {
        console.error('Get session error:', error);
        return null;
    }
};

/**
 * Get current user
 */
const getCurrentUser = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
};

/**
 * Refresh session
 */
const refreshSession = async () => {
    try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) throw error;
        return { success: true, session: data.session };
    } catch (error) {
        console.error('Refresh session error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send password reset email
 */
const resetPassword = async (email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.APP_URL}/reset-password`
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user password
 */
const updatePassword = async (newPassword) => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Update password error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Update user metadata
 */
const updateUserMetadata = async (metadata) => {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: metadata
        });

        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Update metadata error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Admin: Get user by ID
 */
const adminGetUser = async (userId) => {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Admin get user error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Admin: Delete user
 */
const adminDeleteUser = async (userId) => {
    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Admin delete user error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Admin: Update user
 */
const adminUpdateUser = async (userId, updates) => {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            updates
        );
        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Admin update user error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Verify JWT token
 */
const verifyToken = async (token) => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        return { success: true, user };
    } catch (error) {
        console.error('Token verification error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Auth state change listener
 */
const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback);
};

module.exports = {
    supabase,
    supabaseAdmin,

    // Auth functions
    signUp,
    signIn,
    signOut,
    getSession,
    getCurrentUser,
    refreshSession,
    resetPassword,
    updatePassword,
    updateUserMetadata,

    // Admin functions
    adminGetUser,
    adminDeleteUser,
    adminUpdateUser,

    // Utils
    verifyToken,
    onAuthStateChange
};
