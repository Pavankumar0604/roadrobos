// API Configuration
// API Configuration
import { supabase } from './supabaseClient';
// Ensure no circular dependency via auth.ts
import { signUp, signIn, signOut, resetPassword } from './auth';

// Helper to handle Supabase errors consistent with previous API usage
const handleResponse = ({ data, error }: { data: any, error: any }) => {
    if (error) throw new Error(error.message);
    return data;
};

// ============================================================================
// AUTH API (Re-exporting from auth.ts or direct usage)
// ============================================================================


export const authAPI = {
    signUp,
    signIn,
    signOut,
    resetPassword,
    getUser: async () => await supabase.auth.getUser(),
};

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
    getProfile: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        // Fetch additional profile data from public.users
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        return handleResponse({ data, error });
    },

    updateProfile: async (data: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data: updatedData, error } = await supabase
            .from('users')
            .update(data)
            .eq('id', user.id)
            .select()
            .single();

        // Also update auth metadata if name/phone changed
        if (data.name || data.phone) {
            await supabase.auth.updateUser({
                data: {
                    name: data.name,
                    phone: data.phone
                }
            });
        }

        return handleResponse({ data: { user: updatedData, success: true }, error });
    },
};

// ============================================================================
// BIKE API
// ============================================================================

export const bikeAPI = {
    getAll: async (filters?: { type?: string; availability?: string }) => {
        let query = supabase
            .from('bikes')
            .select(`
                *,
                bike_images (image_url, display_order),
                bike_color_variants (color_name, image_url)
            `)
            .order('id', { ascending: true });

        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.availability) query = query.eq('availability', filters.availability);

        const { data, error } = await query;
        if (error) throw new Error(error.message);

        // Transform to match previous API shape
        return data.map((bike: any) => ({
            ...bike,
            specs: {
                cc: bike.cc,
                transmission: bike.transmission
            },
            price: {
                hour: bike.price_hour,
                day: bike.price_day,
                week: bike.price_week,
                month: bike.price_month,
                quarterly: bike.price_quarterly,
                yearly: bike.price_yearly
            },
            minBookingDur: {
                hour: bike.min_booking_hour,
                day: bike.min_booking_day
            },
            kmLimit: {
                hour: bike.km_limit_hour,
                day: bike.km_limit_day,
                week: bike.km_limit_week,
                month: bike.km_limit_month
            },
            excessKmCharge: bike.excess_km_charge,
            images: bike.bike_images?.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => img.image_url) || [],
            colorVariants: bike.bike_color_variants || []
        })).sort((a: any, b: any) => {
            const statusOrder = { 'Available': 0, 'Booked': 1, 'Maintenance': 2, 'Coming Soon': 3 };
            const orderA = statusOrder[a.availability as keyof typeof statusOrder] ?? 99;
            const orderB = statusOrder[b.availability as keyof typeof statusOrder] ?? 99;
            return orderA - orderB;
        });
    },

    getById: async (id: number) => {
        const { data, error } = await supabase
            .from('bikes')
            .select(`
                *,
                bike_images (image_url, display_order),
                bike_color_variants (color_name, image_url)
            `)
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);

        return {
            ...data,
            specs: {
                cc: data.cc,
                transmission: data.transmission
            },
            price: {
                hour: data.price_hour,
                day: data.price_day,
                week: data.price_week,
                month: data.price_month,
                quarterly: data.price_quarterly,
                yearly: data.price_yearly
            },
            minBookingDur: {
                hour: data.min_booking_hour,
                day: data.min_booking_day
            },
            kmLimit: {
                hour: data.km_limit_hour,
                day: data.km_limit_day,
                week: data.km_limit_week,
                month: data.km_limit_month
            },
            excessKmCharge: data.excess_km_charge,
            images: data.bike_images?.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => img.image_url) || [],
            colorVariants: data.bike_color_variants || []
        };
    },
};

// ============================================================================
// BOOKING API
// ============================================================================

export const bookingAPI = {
    // Basic create method
    create: async (bookingData: any, riderInfo?: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Authentication required');

        // 1. Create Rider Info if provided
        let riderInfoId = null;
        if (riderInfo) {
            const { data: riderData, error: riderError } = await supabase
                .from('rider_information')
                .insert({ ...riderInfo, user_id: user.id })
                .select()
                .single();

            if (riderError) throw new Error(riderError.message);
            riderInfoId = riderData.id;
        }

        // 2. Create Booking
        const bookingId = `BK${Date.now()}`;
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                booking_id: bookingId,
                user_id: user.id,
                rider_info_id: riderInfoId,
                ...bookingData,
                status: 'pending'
            })
            .select()
            .single();

        if (bookingError) throw new Error(bookingError.message);

        return {
            success: true,
            booking_id: bookingId,
            id: booking.id
        };
    },

    getMyBookings: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Authentication required');

        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                bikes (name, type)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        // Flatten structure to match old API: bike.name -> bike_name
        return data.map((b: any) => ({
            ...b,
            bike_name: b.bikes?.name,
            bike_type: b.bikes?.type
        }));
    },

    // New public booking methods
    initiate: async (data: any) => {
        // Use Edge Function for secure order creation + DB insertion
        const { data: response, error } = await supabase.functions.invoke('create-booking', {
            body: data
        });

        if (error) throw new Error(error.message);
        return response;
    },

    createCash: async (data: any) => {
        // Use Edge Function or direct DB insert (if policy allows public/anon inserts for this specific flow)
        // For now, assuming direct DB insert allowed for 'cash' flow or via same edge function
        const { data: response, error } = await supabase.functions.invoke('create-booking-cash', {
            body: data
        });
        if (error) throw new Error(error.message);
        return response;
    },

    getById: async (id: string) => {
        // id can be numeric ID or string booking_id (e.g. BK123)
        // Adjust query based on input
        let query = supabase
            .from('bookings')
            .select(`
                *,
                users (name, email),
                bikes (name, type),
                rider_information (user_name, contact_number)
            `);

        if (id.startsWith('BK')) {
            query = query.eq('booking_id', id);
        } else {
            query = query.eq('id', id);
        }

        const { data, error } = await query.single();
        if (error) throw new Error(error.message);

        return {
            ...data,
            user_name: data.users?.name,
            user_email: data.users?.email,
            bike_name: data.bikes?.name,
            bike_type: data.bikes?.type,
            rider_name: data.rider_information?.user_name,
            contact_number: data.rider_information?.contact_number
        };
    },

    updatePaymentStatus: async (id: string, status: 'Paid' | 'Pending' | 'Failed', mode?: string) => {
        const updateData: any = { payment_status: status };
        if (mode) updateData.payment_mode = mode;

        // 1. Update Booking
        const { data: booking, error } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);

        // 2. If Paid, Insert Transaction (to sync with Dashboard Revenue)
        if (status === 'Paid') {
            try {
                // Check if transaction already exists to avoid duplicates
                const { data: existingTx } = await supabase
                    .from('transactions')
                    .select('id')
                    .eq('booking_id', id)
                    .maybeSingle();

                if (!existingTx) {
                    await supabase.from('transactions').insert({
                        booking_id: id,
                        amount: booking.total_payable || booking.total_fare || 0, // Handle both field names
                        status: 'paid',
                        payment_mode: mode || 'CASH',
                        transaction_id: `MANUAL-${Date.now()}` // Generate a manual ID
                    });
                }
            } catch (txError) {
                console.error("Failed to insert transaction record:", txError);
                // Don't fail the main operation, just log
            }
        }

        return booking;
    },
};

/**
 * RAZORPAY LIVE MODE - Payment API
 */
export const paymentAPI = {
    createOrder: async (orderData: {
        amount: number;
        currency: string;
        bookingId?: string;
        userId?: string;
        customerName?: string;
    }) => {
        const { data, error } = await supabase.functions.invoke('payment-order', {
            body: orderData
        });
        if (error) throw new Error(error.message);
        return data;
    },

    verifyPayment: async (paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        booking_id?: string;
        bookingData?: any; // Add bookingData
    }) => {
        const { data, error } = await supabase.functions.invoke('payment-verify', {
            body: paymentData
        });
        if (error) throw new Error(error.message);
        return data;
    },
};

// ============================================================================
// UTILITY API
// ============================================================================

export const utilityAPI = {
    healthCheck: async () => {
        const { error } = await supabase.from('bikes').select('count', { count: 'exact', head: true });
        return {
            status: 'ok',
            database: error ? 'error' : 'connected',
            timestamp: new Date().toISOString()
        };
    },

    generateApplicationNumber: async () => {
        // Simple client-side generation or simplified edge function
        return { applicationNumber: `APP${Date.now()}` };
    },
};


// ============================================================================
// ADMIN API
// ============================================================================

export const adminAPI = {
    getDashboardStats: async () => {
        // Get total bookings count
        const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });

        // Get total revenue from paid transactions
        const { data: revenueData } = await supabase
            .from('transactions')
            .select('amount')
            .eq('status', 'paid');
        const totalRevenue = revenueData?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

        // Get bike count for fleet utilization
        const { count: bikeCount } = await supabase.from('bikes').select('*', { count: 'exact', head: true });
        const { count: activeBookings } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'confirmed');
        const fleetUtilization = bikeCount ? Math.round((activeBookings || 0) / bikeCount * 100) : 0;

        // Get new applications count
        const { count: newApplications } = await supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('status', 'Pending');

        // Get pending enquiries
        const { count: pendingEnquiries } = await supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'New');

        // Get pending reviews
        const { count: pendingReviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'Pending');

        return {
            totalBookings: bookingCount || 0,
            totalRevenue: totalRevenue,
            fleetUtilization: fleetUtilization,
            newPartners: newApplications || 0,
            pendingEnquiries: pendingEnquiries || 0,
            pendingReviews: pendingReviews || 0,
            bikeCount: bikeCount || 0
        };
    },

    getTransactions: async () => {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                *,
                bookings (booking_id),
                users (name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return data.map((t: any) => ({
            ...t,
            customerName: t.customer_name || t.users?.name || 'Guest User',
            bookingId: t.booking_id || t.bookings?.booking_id
        }));
    },

    // Bikes
    getBikes: async () => {
        // Fetch all bikes with related data
        const { data, error } = await supabase
            .from('bikes')
            .select(`
                *,
                bike_images (image_url, display_order),
                bike_color_variants (color_name, image_url)
            `)
            .neq('availability', 'Archived') // Filter out soft-deleted bikes
            .order('id', { ascending: true });

        if (error) throw error;

        // Transform flat DB structure to nested frontend structure
        return data.map((bike: any) => ({
            id: bike.id,
            name: bike.name,
            type: bike.type,
            availability: bike.availability,
            specs: {
                cc: bike.cc,
                transmission: bike.transmission
            },
            price: {
                hour: bike.price_hour,
                day: bike.price_day,
                week: bike.price_week,
                month: bike.price_month,
                quarterly: bike.price_quarterly,
                yearly: bike.price_yearly
            },
            minBookingDur: {
                hour: bike.min_booking_hour,
                day: bike.min_booking_day
            },
            kmLimit: {
                hour: bike.km_limit_hour,
                day: bike.km_limit_day,
                week: bike.km_limit_week,
                month: bike.km_limit_month
            },
            excessKmCharge: bike.excess_km_charge,
            deposit: bike.deposit || 0,
            images: bike.bike_images?.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => img.image_url) || [],
            colorVariants: bike.bike_color_variants || []
        }));
    },

    createBike: async (data: any) => {
        // 1. Prepare flat bike object
        const bikePayload = {
            name: data.name,
            type: data.type,
            availability: data.availability,
            cc: data.specs?.cc,
            transmission: data.specs?.transmission,
            deposit: Number(data.deposit),

            // Prices
            price_hour: Number(data.price?.hour),
            price_day: Number(data.price?.day),
            price_week: Number(data.price?.week),
            price_month: Number(data.price?.month),

            // Limits
            km_limit_hour: Number(data.kmLimit?.hour || 0),
            km_limit_day: Number(data.kmLimit?.day || 0),
            km_limit_week: Number(data.kmLimit?.week || 0),
            km_limit_month: Number(data.kmLimit?.month || 0),
            excess_km_charge: Number(data.excessKmCharge || 0),

            // Min Booking
            min_booking_hour: Number(data.minBookingDur?.hour || 0),
            min_booking_day: Number(data.minBookingDur?.day || 0)
        };

        // 2. Insert into bikes table
        const { data: bike, error } = await supabase
            .from('bikes')
            .insert(bikePayload)
            .select()
            .single();

        if (error) throw error;

        // 3. Insert images if any
        if (data.images && data.images.length > 0) {
            const imageInserts = data.images
                .filter((url: string) => url && url.trim() !== '')
                .map((url: string, index: number) => ({
                    bike_id: bike.id,
                    image_url: url,
                    display_order: index + 1
                }));

            if (imageInserts.length > 0) {
                await supabase.from('bike_images').insert(imageInserts);
            }
        }

        return bike;
    },

    updateBike: async (id: number, data: any) => {
        // 1. Prepare flat bike object
        const bikePayload = {
            name: data.name,
            type: data.type,
            availability: data.availability,
            cc: data.specs?.cc,
            transmission: data.specs?.transmission,
            deposit: Number(data.deposit),

            // Prices
            price_hour: Number(data.price?.hour),
            price_day: Number(data.price?.day),
            price_week: Number(data.price?.week),
            price_month: Number(data.price?.month),

            // Limits
            km_limit_hour: Number(data.kmLimit?.hour || 0),
            km_limit_day: Number(data.kmLimit?.day || 0),
            km_limit_week: Number(data.kmLimit?.week || 0),
            km_limit_month: Number(data.kmLimit?.month || 0),
            excess_km_charge: Number(data.excessKmCharge || 0),

            // Min Booking
            min_booking_hour: Number(data.minBookingDur?.hour || 0),
            min_booking_day: Number(data.minBookingDur?.day || 0)
        };

        // 2. Update bikes table
        const { data: bike, error } = await supabase
            .from('bikes')
            .update(bikePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // 3. Update images (Delete all and re-insert)
        if (data.images) {
            // Delete existing
            await supabase.from('bike_images').delete().eq('bike_id', id);

            // Insert new
            const imageInserts = data.images
                .filter((url: string) => url && url.trim() !== '')
                .map((url: string, index: number) => ({
                    bike_id: id,
                    image_url: url,
                    display_order: index + 1
                }));

            if (imageInserts.length > 0) {
                await supabase.from('bike_images').insert(imageInserts);
            }
        }

        return bike;
    },

    deleteBike: async (id: number) => {
        // Soft delete: Mark as 'Archived' instead of actual delete
        // This prevents foreign key errors with existing bookings
        return handleResponse(await supabase
            .from('bikes')
            .update({ availability: 'Archived' })
            .eq('id', id)
        );
    },

    // Offers
    getOffers: async () => {
        const { data, error } = await supabase.from('offers').select('*');
        const offers = handleResponse({ data, error });
        // Map snake_case to camelCase to match Offer interface
        return offers.map((o: any) => ({
            id: o.id,
            title: o.title,
            type: o.type,
            code: o.code,
            discountPercent: o.discount_percent,
            flatAmount: o.flat_amount,
            validityDate: o.validity_date,
            applicableCities: o.applicable_cities,
            minBooking: o.min_booking,
            imagePlaceholder: o.image_placeholder,
            descriptionBullets: o.description_bullets,
            endsIn: o.ends_in,
            autoApplied: o.auto_applied, // Note: DB might not have this column if script fixed, but type has it
            status: o.status,
            usageLimitPerUser: o.usage_limit_per_user,
            totalUses: o.total_uses
        }));
    },
    createOffer: async (data: any) => handleResponse(await supabase.from('offers').insert(data)),
    updateOffer: async (id: string, data: any) => handleResponse(await supabase.from('offers').update(data).eq('id', id)),
    deleteOffer: async (id: string) => handleResponse(await supabase.from('offers').delete().eq('id', id)),

    // Enquiries
    getEnquiries: async () => handleResponse(await supabase.from('enquiries').select('*')),
    createEnquiry: async (data: any) => {
        const { data: result, error } = await supabase.functions.invoke('submit-enquiry', { body: data });
        if (error) throw new Error(error.message);
        return result;
    },
    deleteEnquiry: async (id: string) => handleResponse(await supabase.from('enquiries').delete().eq('id', id)),

    // Reviews
    getReviews: async () => handleResponse(await supabase.from('reviews').select('*')),
    createReview: async (data: any) => {
        const { data: result, error } = await supabase.functions.invoke('submit-review', { body: data });
        if (error) throw new Error(error.message);
        return result;
    },
    updateReview: async (id: string, data: any) => handleResponse(await supabase.from('reviews').update({ status: data.status }).eq('id', id)),
    deleteReview: async (id: string) => handleResponse(await supabase.from('reviews').delete().eq('id', id)),

    // Locations (using pickup_locations table)
    getLocations: async () => {
        const { data, error } = await supabase.from('pickup_locations').select('*').eq('is_active', true);
        if (error) throw error;
        return data?.map((l: any) => l.name) || [];
    },
    createLocation: async (name: string) => handleResponse(await supabase.from('pickup_locations').insert({ name, is_active: true })),
    updateLocation: async (oldName: string, name: string) => handleResponse(await supabase.from('pickup_locations').update({ name }).eq('name', oldName)),
    deleteLocation: async (name: string) => handleResponse(await supabase.from('pickup_locations').delete().eq('name', name)),

    // Employees
    getEmployees: async () => handleResponse(await supabase.from('employees').select('*')),
    createEmployee: async (data: any) => handleResponse(await supabase.from('employees').insert(data)),
    updateEmployee: async (id: string, data: any) => handleResponse(await supabase.from('employees').update(data).eq('id', id)),
    deleteEmployee: async (id: string) => handleResponse(await supabase.from('employees').delete().eq('id', id)),

    // Applications (using job_applications table)
    getApplications: async () => {
        const { data, error } = await supabase.from('job_applications').select('*').order('applied_date', { ascending: false });
        if (error) throw error;
        return data?.map((app: any) => ({
            id: app.id,
            applicantName: app.applicant_name,
            applicantEmail: app.email,
            applicantPhone: app.phone,
            job: { id: 'job-1', title: app.position, location: 'Bangalore', type: 'Full-time', department: 'Operations' },
            resumeFileName: app.position ? `${app.applicant_name}_Resume.pdf` : 'Resume.pdf',
            resumeFileContent: app.resume_url || '',
            submittedAt: app.applied_date,
            status: app.status
        })) || [];
    },
    createApplication: async (data: any) => {
        // Use Edge Function to bypass RLS
        const requestData = {
            applicantName: data.applicantName,
            applicantEmail: data.applicantEmail || data.email,
            applicantPhone: data.applicantPhone || data.phone,
            jobTitle: data.job?.title,
            position: data.position,
            resumeUrl: data.resumeFileContent || data.resumeUrl || ''
        };

        console.log('=== Submitting Application via Edge Function ===');
        console.log('Request data:', requestData);

        const { data: result, error } = await supabase.functions.invoke('submit-application', {
            body: requestData
        });

        if (error) {
            console.error('=== Application Submission Error ===', error);
            throw new Error(error.message);
        }

        if (!result.success) {
            console.error('=== Application Failed ===', result.error);
            throw new Error(result.error || 'Application submission failed');
        }

        console.log('=== Application Submitted Successfully ===', result.data);
        return result.data;
    },
    updateApplication: async (id: string, status: string) => handleResponse(await supabase.from('job_applications').update({ status }).eq('id', id)),
    deleteApplication: async (id: string) => handleResponse(await supabase.from('job_applications').delete().eq('id', id)),

    // Site Content
    getSiteContent: async () => {
        const { data, error } = await supabase.from('site_content').select('content').eq('id', 1).single();
        if (error) return {};
        return data.content;
    },
    updateSiteContent: async (data: any) => {
        const { error } = await supabase.from('site_content').upsert({ id: 1, content: data });
        if (error) throw error;
        return { success: true };
    },

    // Admin Users
    getAdminUsers: async () => {
        const { data, error } = await supabase
            .from('admin_users')
            .select(`
                id, role,
                users(id, name, email)
            `);
        if (error) throw error;
        return data.map((au: any) => ({
            id: au.id,
            role: au.role,
            user_id: au.users?.id,
            name: au.users?.name,
            email: au.users?.email
        }));
    },
    createAdminUser: async (data: any) => {
        // This is complex because it involves creating an Auth user + Admin entry
        // Should ideally be an Edge Function 'create-admin-user'
        console.warn('Creating admin user requires Edge Function or Service Role');
        return { success: false, error: 'Not implemented client-side' };
    },
    resetUserPassword: async (id: string, password: string) => {
        // Also restricted
        return { success: false, error: 'Not implemented client-side' };
    },
};

// Export all
export const api = {
    auth: authAPI,
    user: userAPI,
    bike: bikeAPI,
    booking: bookingAPI,
    payment: paymentAPI,
    utility: utilityAPI,
    admin: adminAPI,
};

export default api;
