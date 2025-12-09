import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const body = await req.json()
        const {
            applicantName,
            applicantEmail,
            applicantPhone,
            position,
            jobTitle,
            resumeUrl
        } = body

        // Validate required fields
        if (!applicantName || !applicantEmail) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Insert application
        const { data, error } = await supabase
            .from('job_applications')
            .insert({
                id: `APP${Date.now()}`,
                applicant_name: applicantName,
                email: applicantEmail,
                phone: applicantPhone || null,
                position: jobTitle || position || 'General Application',
                resume_url: resumeUrl || '',
                status: 'Pending',
                applied_date: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Error inserting application:', error)
            return new Response(
                JSON.stringify({ success: false, error: error.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ success: true, data }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Unexpected error:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
