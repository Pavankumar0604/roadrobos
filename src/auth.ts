import { supabase } from './supabaseClient';

// Helper for consistency with previous API
export const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error getting session:', error);
        return null;
    }
    return session;
};

export const getAuthToken = async () => {
    const session = await getSession();
    return session?.access_token || null;
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// Map Supabase response to old format for compatibility if needed, 
// but better to just export the Supabase functions directly or wrappers
// The existing frontend likely expects { success, user, token, error }

export async function signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: metadata?.name,
                phone: metadata?.phone
            }
        }
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        user: data.user,
        session: data.session
    };
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        user: data.user,
        session: data.session
    };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function updateUserMetadata(metadata: any) {
    const { data, error } = await supabase.auth.updateUser({
        data: metadata
    });

    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });

    return { data: { subscription } };
}

// Ensure the default export or named export matches typical usage
export { supabase };

