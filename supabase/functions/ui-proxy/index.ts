// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"

Deno.serve(async (req) => {
  const url = new URL(req.url);
  
  // The path coming in will be: /functions/v1/ui-proxy/search
  // We need to keep that path when we fetch from your host (Vercel/GitHub Pages)
  const targetUrl = new URL(url.pathname + url.search, "https://openflix-noj3.onrender.com");

  const res = await fetch(targetUrl.toString(), {
    headers: req.headers,
  });

  // If the user visits a route directly (like /search) and the host returns 404
  // we need to serve the index.html so React Router can take over.
  if (res.status === 404 && !url.pathname.includes(".")) {
    const indexRes = await fetch("https://openflix-noj3.onrender.com/index.html");
    return new Response(indexRes.body, {
      headers: { ...Object.fromEntries(indexRes.headers), "Content-Type": "text/html" },
    });
  }

  return res;
});