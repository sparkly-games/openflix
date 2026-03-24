import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle Preflight (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.searchParams.get('path')
    const isImage = url.searchParams.get('image') === 'true'

    if (!path) {
      return new Response(JSON.stringify({ error: 'Missing path parameter' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 2. Route the request: Image Server vs API Server
    const tmdbUrl = isImage 
      ? `https://image.tmdb.org/t/p/original${path}`
      : `https://api.themoviedb.org/3${path}?${url.searchParams.toString()}`

    const response = await fetch(tmdbUrl, {
      headers: { 
        Authorization: `Bearer ${Deno.env.get('TMDB_TOKEN')}`,
        Accept: isImage ? 'image/*' : 'application/json'
      }
    })

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'TMDB Fetch Failed' }), { 
        status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 3. Handle the Body (Images must be blobs, JSON can be text)
    const body = isImage ? await response.blob() : await response.text()

    // 4. Return the Final Response with forced Content-Type
    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        // CRITICAL: This fixes the "invisible image" bug
        'Content-Type': isImage ? 'image/jpeg' : 'application/json',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cross-Origin-Embedder-Policy': 'credentialless',
        'Cache-Control': 'public, max-age=31536000', // Cache images for 1 year
      }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})