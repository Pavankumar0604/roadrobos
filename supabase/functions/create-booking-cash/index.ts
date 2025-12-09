import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        const reqData = await req.json()
        console.log('Received Payload:', JSON.stringify(reqData, null, 2))
        const { bike, user: rider, addons, paymentMode, baseFare, platformFee, totalPayable, searchParams } = reqData

        // 1. Create/Get Rider Info - Use upsert to handle duplicates
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

        if (riderError) {
            console.error('Rider Upsert Error:', riderError)
            throw riderError
        }

        // --- DEMO BIKE AUTO-FIX ---
        if (bike.id === 999) {
            console.log('Checking if Demo Bike exists...');
            const { data: demoBike, error: bikeCheckError } = await supabase
                .from('bikes')
                .select('id')
                .eq('id', 999)
                .maybeSingle();

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
                }
            } else {
                console.log('Demo Bike already exists');
            }
        }
        // --------------------------

        // 2. Create Booking
        const bookingId = `BK${Date.now()}`

        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                booking_id: bookingId,
                user_id: rider.userId || null,
                rider_info_id: riderData.id,
                bike_id: bike.id,
                status: 'pending',
                payment_status: 'pending',
                payment_mode: 'CASH',
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

        if (bookingError) {
            console.error('Booking Insert Error:', bookingError)
            throw bookingError
        }

        return new Response(
            JSON.stringify({ success: true, bookingId: bookingId, id: booking.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        console.error('=== CASH BOOKING ERROR ===');
        console.error('Error Message:', error.message);
        console.error('Error Details:', JSON.stringify(error, null, 2));
        console.error('Error Stack:', error.stack);

        // Return more detailed error to frontend
        return new Response(
            JSON.stringify({
                error: error.message || 'Unknown error',
                details: error.details || 'No additional details',
                hint: error.hint || 'Check server logs'
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
