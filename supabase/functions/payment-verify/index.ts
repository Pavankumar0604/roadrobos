import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingData } = await req.json()

        const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')!

        // 1. Verify Signature using Web Crypto API
        const text = new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`);
        const key = new TextEncoder().encode(key_secret);

        const keyObj = await crypto.subtle.importKey(
            "raw",
            key,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign", "verify"]
        );

        const signatureBytes = new Uint8Array(
            (razorpay_signature.match(/[\da-f]{2}/gi) || []).map((h: string) => parseInt(h, 16))
        );

        const verified = await crypto.subtle.verify(
            "HMAC",
            keyObj,
            signatureBytes,
            text
        );

        if (!verified) {
            console.error("Signature verification failed");
            throw new Error("Invalid payment signature");
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        // 2. Create Rider Info & Booking IF verified
        // We expect `bookingData` to contain: { user: RiderInformation, bike, searchParams, bookingId, addons, totalPayable... }

        if (!bookingData) {
            throw new Error("Missing booking data for creation");
        }

        const { user: rider, bike, searchParams, addons, totalPayable, bookingId, platformFee } = bookingData;

        // A. Insert Rider Info
        const { data: riderData, error: riderError } = await supabase
            .from('rider_information')
            .insert({
                user_id: rider.userId || null,
                user_name: rider.userName,
                email_id: rider.emailId,
                contact_number: rider.contactNumber,
                alternate_number: rider.altContactNumber,
                local_address: rider.address,
                id_proof: rider.idCardType || 'Aadhaar Card',
                id_number: rider.idCardNumber,
                aadhaar_document_url: rider.aadhaarDocumentUrl || null,
                pan_document_url: rider.panDocumentUrl || null,
                license_document_url: rider.licenseDocumentUrl || null
            })
            .select()
            .single()

        if (riderError) throw riderError;

        // --- DEMO BIKE AUTO-FIX ---
        if (bike.id === 999) {
            console.log('Checking if Demo Bike exists...');
            const { data: demoBike, error: bikeCheckError } = await supabase
                .from('bikes')
                .select('id')
                .eq('id', 999)
                .maybeSingle(); // Use maybeSingle to avoid error if not found

            if (bikeCheckError) {
                console.error('Error checking for Demo Bike:', bikeCheckError);
            }

            if (!demoBike) {
                console.log('Demo Bike missing. Auto-inserting...');
                const { error: insertError } = await supabase.from('bikes').insert({
                    id: 999,
                    name: 'Demo Bike (Test)',
                    type: 'Scooter',
                    cc: 'Test Spec',
                    transmission: 'Automatic',
                    price_hour: 1, price_day: 1, price_week: 1, price_month: 1,
                    price_quarterly: 1, price_yearly: 1,
                    min_booking_hour: 1, min_booking_day: 1,
                    km_limit_hour: 10, km_limit_day: 100, km_limit_week: 500, km_limit_month: 2000,
                    excess_km_charge: 1, deposit: 1, availability: 'Available'
                });

                if (insertError) {
                    console.error('Failed to insert Demo Bike:', insertError);
                    // Continue anyway - might already exist from parallel request
                }
            } else {
                console.log('Demo Bike already exists');
            }
        }
        // --------------------------

        // B. Insert Booking
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                booking_id: bookingId, // Use the ID generated in step 1 or passed here
                user_id: rider.userId || null,
                rider_info_id: riderData.id,
                bike_id: bike.id,
                status: 'confirmed',     // Directly confirmed!
                payment_status: 'paid', // Directly paid!
                payment_mode: 'ONLINE',
                total_payable: totalPayable,
                pickup_location: searchParams?.pickupLocation || null,
                pickup_date: searchParams?.pickupDate || null,
                pickup_time: searchParams?.pickupTime || null,
                drop_date: searchParams?.dropDate || null,
                drop_time: searchParams?.dropTime || null,
                city: searchParams?.city || null
            })
            .select()
            .single()

        if (bookingError) throw bookingError;

        // C. Record Transaction (Optional but good for history)
        await supabase.from('transactions').insert({
            booking_id: booking.id,
            amount: totalPayable,
            status: 'paid',
            payment_mode: 'ONLINE',
            transaction_id: razorpay_payment_id
        });


        return new Response(
            JSON.stringify({ success: true, verified: true, bookingId: bookingId, id: booking.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error("Payment Verification/Booking Creation Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
