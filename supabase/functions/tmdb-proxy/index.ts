import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.searchParams.get('path')
    
    if (!path) {
      return new Response(JSON.stringify({ error: 'Missing path' }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 2. Clone the search params and remove 'path' to get the TMDB params (like query, page, etc.)
    const tmdbParams = new URLSearchParams(url.searchParams)
    tmdbParams.delete('path')

    // 3. Construct TMDB URL
    const isImage = path.startsWith('/t/p/')
    const base = isImage ? 'https://image.tmdb.org' : 'https://api.themoviedb.org/3'
    const finalUrl = `${base}${path}${tmdbParams.toString() ? '?' + tmdbParams.toString() : ''}`

    // 4. Fetch from TMDB
    const response = await fetch(finalUrl, {
      headers: {
        Authorization: `Bearer ${Deno.env.get('TMDB_TOKEN')}`,
      },
    })

    // 5. Proxy the response back
    const contentType = response.headers.get('Content-Type') || 'application/json'
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': contentType }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})