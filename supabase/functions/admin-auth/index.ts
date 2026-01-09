import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminAuthRequest {
  password: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { password } = await req.json() as AdminAuthRequest

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client with service role key (has full access)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify password using the secure function
    const { data, error } = await supabaseAdmin.rpc('verify_admin_password', {
      admin_email: 'admin@hsbc.local',
      admin_password: password
    })

    if (error) {
      console.error('Password verification error:', error)
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Invalid password' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Password is correct - create a signed admin token
    const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const payload = { iat: Date.now(), exp: Date.now() + 60 * 60 * 1000 } // 1h
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )
    const dataToSign = JSON.stringify(payload)
    const signatureBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign))
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuf)))
    const adminToken = `${btoa(dataToSign)}.${signature}`

    return new Response(
      JSON.stringify({ 
        success: true,
        admin_token: adminToken
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Admin auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
