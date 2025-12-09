import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

    try {
        // We don't need Supabase client here anymore for DB inserts, 
        // but we might keep it if we want to validate something in future.
        // For now, we just proceed to generic Razorpay order creation.

        const reqData = await req.json()
        console.log('Received Payload:', JSON.stringify(reqData, null, 2))
        const { totalPayable, user: rider } = reqData

        // 1. Generate Booking ID (Reference for Razorpay)
        const bookingId = `BK${Date.now()}`

        // 2. Create Razorpay Order
        const key_id = Deno.env.get('RAZORPAY_KEY_ID')
        const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')

        if (!key_id || !key_secret) {
            console.error('Razorpay Error: Missing Keys')
            throw new Error('Razorpay keys not configured')
        }

        const auth = btoa(`${key_id}:${key_secret}`)
        const amountInPaise = Math.round((totalPayable || 0) * 100)

        // Ensure receipt is valid string (max 40 chars)
        const receiptId = String(bookingId || '').substring(0, 40) || `bk_${Date.now()}`

        // Sanitize notes - Razorpay REQUIRES string values for notes
        const notes = {
            booking_id: String(bookingId || ''),
            user_id: String(rider?.userId || 'guest'),
            user_email: String(rider?.emailId || '').substring(0, 50)
        }

        console.log('Creating Razorpay Order:', { amount: amountInPaise, currency: 'INR', receipt: receiptId, notes })

        const rpRes = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amountInPaise,
                currency: 'INR',
                receipt: receiptId,
                notes: notes
            })
        })

        const order = await rpRes.json()

        if (order.error) {
            console.error('Razorpay API Error:', JSON.stringify(order))
            throw new Error(order.error.description || 'Razorpay Order Creation Failed')
        }

        console.log('Razorpay Order Created:', order.id)

        return new Response(
            JSON.stringify({
                success: true,
                bookingId: bookingId,
                razorpayOrderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: key_id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
