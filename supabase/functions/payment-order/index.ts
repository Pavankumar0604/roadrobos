import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Razorpay (could use razorpay-node but tricky in Deno, use fetch API for orders)
// Or use a lightweight wrapper

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

    try {
        const { amount, currency, receipt } = await req.json()

        const key_id = Deno.env.get('RAZORPAY_KEY_ID')
        const key_secret = Deno.env.get('RAZORPAY_KEY_SECRET')

        if (!key_id || !key_secret) throw new Error('Razorpay keys not configured')

        const auth = btoa(`${key_id}:${key_secret}`)

        // Create Razorpay Order
        const resp = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Amount in paise
                currency: currency || 'INR',
                receipt: receipt || `rcpt_${Date.now()}`
            })
        })

        const order = await resp.json()
        if (order.error) throw new Error(order.error.description)

        return new Response(
            JSON.stringify(order),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
