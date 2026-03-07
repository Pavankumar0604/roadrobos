import { supabase } from './supabaseClient';
import { signUp, signIn, signOut, resetPassword } from './auth';
import { type Bike, type PickupLocation, type LocationStatus } from '../types';
import { bikes as constantsBikes, pickupLocations as constantsLocations } from '../constants';
import { getBikeImage, getFallbackImage } from './assets/bikeImports';

// --- SUPABASE CONFIGURATION ---
const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to handle Supabase errors consistent with previous API usage
const handleResponse = ({ data, error, status }: { data: any, error: any, status?: number }) => {
    if (error) {
        console.error(`[Supabase Error] Status ${status || 'unknown'}:`, error);
        throw new Error(error.message || 'Database operation failed');
    }
    return data;
};

// Safe numeric conversion to prevent NaN errors
const toN = (val: any) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
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
            availableCount: bike.available_count || (bike.total_stock || 0) - (bike.booked_count || 0),
            service_status: bike.service_status || 'none',
            currentStatus: bike.current_status || 'readyRent',
            checks: bike.checks || {},
            assignedTech: bike.assigned_tech || '',
            spareParts: bike.spare_parts || [],
            partsReport: bike.parts_report || '',
            images: bike.bike_images?.length > 0
                ? bike.bike_images.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => getBikeImage(img.image_url, bike.name))
                : [getFallbackImage(bike.name)],
            colorVariants: (bike.bike_color_variants || []).map((cv: any) => ({
                colorName: cv.color_name,
                imageUrl: cv.image_url
            }))
        })).filter((b: any) => b.images !== undefined).sort((a: any, b: any) => {
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
            availableCount: data.available_count || (data.total_stock || 0) - (data.booked_count || 0),
            service_status: data.service_status || 'none',
            currentStatus: data.current_status || 'readyRent',
            checks: data.checks || {},
            assignedTech: data.assigned_tech || '',
            spareParts: data.spare_parts || [],
            partsReport: data.parts_report || '',
            images: data.bike_images?.length > 0 ? data.bike_images.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => getBikeImage(img.image_url, data.name)) : [getFallbackImage(data.name)],
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
            totalStock: bike.total_stock || 0,
            bookedCount: bike.booked_count || 0,
            availableCount: bike.available_count || (bike.total_stock || 0) - (bike.booked_count || 0),
            service_status: bike.service_status || 'none',
            currentStatus: bike.current_status || 'readyRent',
            checks: bike.checks || {},
            assignedTech: bike.assigned_tech || '',
            spareParts: bike.spare_parts || [],
            partsReport: bike.parts_report || '',
            images: bike.bike_images?.length > 0 ? bike.bike_images.sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => getBikeImage(img.image_url, bike.name)) : [getFallbackImage(bike.name)],
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
            deposit: toN(data.deposit),

            // Prices
            price_hour: toN(data.price?.hour),
            price_day: toN(data.price?.day),
            price_week: toN(data.price?.week),
            price_month: toN(data.price?.month),

            // Stock
            total_stock: toN(data.totalStock || 0),
            booked_count: toN(data.bookedCount || 0),
            available_count: toN((data.totalStock || 0) - (data.bookedCount || 0)),

            // Limits
            km_limit_hour: toN(data.kmLimit?.hour || 0),
            km_limit_day: toN(data.kmLimit?.day || 0),
            km_limit_week: toN(data.kmLimit?.week || 0),
            km_limit_month: toN(data.kmLimit?.month || 0),
            excess_km_charge: toN(data.excessKmCharge || 0),

            // Min Booking
            min_booking_hour: toN(data.minBookingDur?.hour || 0),
            min_booking_day: toN(data.minBookingDur?.day || 0),

            // Service Fields
            service_status: data.service_status || 'none',
            current_status: data.currentStatus || 'readyRent',
            checks: data.checks || {},
            assigned_tech: data.assignedTech || '',
            spare_parts: data.spareParts || [],
            parts_report: data.partsReport || ''
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

        // 4. Insert color variants if any
        if (data.colorVariants && data.colorVariants.length > 0) {
            const colorInserts = data.colorVariants.map((cv: any) => ({
                bike_id: bike.id,
                color_name: cv.colorName,
                image_url: cv.imageUrl || ''
            }));
            await supabase.from('bike_color_variants').insert(colorInserts);
        }

        return bike;
    },

    updateBike: async (id: number, data: any) => {
        // 1. Prepare dynamic bike payload (Partial Updates)
        const bikePayload: any = {};

        if (data.name !== undefined) bikePayload.name = data.name;
        if (data.type !== undefined) bikePayload.type = data.type;
        if (data.availability !== undefined) bikePayload.availability = data.availability;
        if (data.specs?.cc !== undefined) bikePayload.cc = data.specs.cc;
        if (data.specs?.transmission !== undefined) bikePayload.transmission = data.specs.transmission;
        if (data.deposit !== undefined) bikePayload.deposit = toN(data.deposit);

        // Prices
        if (data.price?.hour !== undefined) bikePayload.price_hour = toN(data.price.hour);
        if (data.price?.day !== undefined) bikePayload.price_day = toN(data.price.day);
        if (data.price?.week !== undefined) bikePayload.price_week = toN(data.price.week);
        if (data.price?.month !== undefined) bikePayload.price_month = toN(data.price.month);
        if (data.price?.quarterly !== undefined) bikePayload.price_quarterly = toN(data.price.quarterly);
        if (data.price?.yearly !== undefined) bikePayload.price_yearly = toN(data.price.yearly);

        // Stock (Only update if explicitly provided, avoid resetting to 0)
        if (data.totalStock !== undefined) {
            bikePayload.total_stock = toN(data.totalStock);
            if (data.bookedCount !== undefined) {
                bikePayload.booked_count = toN(data.bookedCount);
                bikePayload.available_count = toN(data.totalStock - data.bookedCount);
            }
        }

        // Limits
        if (data.kmLimit?.hour !== undefined) bikePayload.km_limit_hour = toN(data.kmLimit.hour);
        if (data.kmLimit?.day !== undefined) bikePayload.km_limit_day = toN(data.kmLimit.day);
        if (data.kmLimit?.week !== undefined) bikePayload.km_limit_week = toN(data.kmLimit.week);
        if (data.kmLimit?.month !== undefined) bikePayload.km_limit_month = toN(data.kmLimit.month);
        if (data.excessKmCharge !== undefined) bikePayload.excess_km_charge = toN(data.excessKmCharge);

        // Min Booking
        if (data.minBookingDur?.hour !== undefined) bikePayload.min_booking_hour = toN(data.minBookingDur.hour);
        if (data.minBookingDur?.day !== undefined) bikePayload.min_booking_day = toN(data.minBookingDur.day);

        // Service Fields
        if (data.service_status !== undefined) bikePayload.service_status = data.service_status;
        if (data.currentStatus !== undefined) bikePayload.current_status = data.currentStatus;
        if (data.checks !== undefined) bikePayload.checks = data.checks;
        if (data.assignedTech !== undefined) bikePayload.assigned_tech = data.assignedTech;
        if (data.spareParts !== undefined) bikePayload.spare_parts = data.spareParts;
        if (data.partsReport !== undefined) bikePayload.parts_report = data.partsReport;

        // 2. Update bikes table
        const { data: bike, error, status } = await supabase
            .from('bikes')
            .update(bikePayload)
            .eq('id', id)
            .select()
            .single();

        // 3. Update images (Delete all and re-insert)
        if (data.images !== undefined) { // Check if images array was provided in the update data
            await supabase.from('bike_images').delete().eq('bike_id', id);
            if (data.images.length > 0) {
                const imageInserts = data.images
                    .filter((url: string) => url && url.trim() !== '')
                    .map((url: string, index: number) => ({
                        bike_id: id,
                        image_url: url,
                        display_order: index + 1
                    }));
                await supabase.from('bike_images').insert(imageInserts);
            }
        }

        // 4. Update color variants (Delete all and re-insert)
        if (data.colorVariants !== undefined) { // Check if colorVariants array was provided in the update data
            await supabase.from('bike_color_variants').delete().eq('bike_id', id);
            if (data.colorVariants.length > 0) {
                const colorInserts = data.colorVariants.map((cv: any) => ({
                    bike_id: id,
                    color_name: cv.colorName,
                    image_url: cv.imageUrl || ''
                }));
                await supabase.from('bike_color_variants').insert(colorInserts);
            }
        }

        return handleResponse({ data: bike, error, status });
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
    getLocations: async (): Promise<PickupLocation[]> => {
        const { data, error } = await supabase.from('pickup_locations').select('*').eq('is_active', true);
        if (error) {
            console.warn("Failed to fetch locations, using constants:", error);
            return constantsLocations;
        }

        return (data || []).map((l: any) => {
            let status: LocationStatus = 'active';
            const name = l.name.toLowerCase();

            if (name.includes('jayanagar') || name.includes('koramangala')) {
                status = 'busy';
            } else if (name.includes('ejipura') || name.includes('kanakapura')) {
                status = 'unavailable';
            }

            return { name: l.name, status };
        });
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

    // Bike Units (Individual Assets)
    getBikeUnits: async () => {
        const { data, error } = await supabase
            .from('bike_units')
            .select(`
                *,
                bikes (name, type)
            `)
            .order('unit_number', { ascending: true });
        if (error) throw error;
        return data;
    },

    addBikeUnit: async (unit: any) => {
        const { data, error } = await supabase
            .from('bike_units')
            .insert(unit)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    updateBikeUnit: async (id: string, updates: any) => {
        // Map camelCase to snake_case for updates if needed, though most units use snake_case
        const payload: any = {};
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.unit_number !== undefined) payload.unit_number = updates.unit_number;
        if (updates.color_name !== undefined) payload.color_name = updates.color_name;
        if (updates.last_service_km !== undefined) payload.last_service_km = updates.last_service_km;

        // Service fields mapping (matches SQL addition)
        if (updates.service_status !== undefined) payload.service_status = updates.service_status;
        if (updates.checks !== undefined) payload.checks = updates.checks;
        if (updates.assigned_tech !== undefined) payload.assigned_tech = updates.assigned_tech;
        if (updates.spare_parts !== undefined) payload.spare_parts = updates.spare_parts;
        if (updates.parts_report !== undefined) payload.parts_report = updates.parts_report;

        const { data, error, status } = await supabase
            .from('bike_units')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        return handleResponse({ data, error, status });
    },

    deleteBikeUnit: async (id: string) => {
        const { error } = await supabase
            .from('bike_units')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
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

    // Parts Inventory
    getPartsInventory: async () => {
        const { data, error } = await supabase.from('parts_inventory').select('*').order('sr_no', { ascending: true });
        if (error) throw error;
        return (data || []).map((p: any) => ({
            srNo: p.sr_no,
            name: p.name,
            price: p.price,
            category: p.category,
            stock: { current: p.stock_current, min: p.stock_min, max: p.stock_max },
            highValue: p.high_value,
            lastOrdered: p.last_ordered,
            compatibleModels: p.compatible_models || []
        }));
    },

    updatePartStock: async (srNo: number, delta: number) => {
        // Atomic update would be better via RPC, but for now simple fetch-update or direct update if we trust current
        // Let's use a simple update for stock_current
        const { data: currentPart, error: fetchError } = await supabase.from('parts_inventory').select('stock_current').eq('sr_no', srNo).single();
        if (fetchError) throw fetchError;

        const newStock = Math.max(0, (currentPart.stock_current || 0) + delta);
        const { data, error } = await supabase
            .from('parts_inventory')
            .update({ stock_current: newStock })
            .eq('sr_no', srNo)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    getServiceLogs: async () => {
        const { data, error } = await supabase
            .from('service_logs')
            .select(`
                *,
                bike: bikes(name)
            `)
            .order('completed_at', { ascending: false });
        if (error) throw error;
        return (data || []).map((l: any) => ({
            id: l.id,
            name: l.bike?.name || 'Unknown Bike',
            tech: l.technician || 'Staff',
            parts: (l.parts_replaced || []).join(', '),
            cost: l.cost,
            date: l.completed_at ? new Date(l.completed_at).toLocaleDateString() : 'Recent',
            status: 'Verified'
        }));
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
