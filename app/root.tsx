import { Outlet, Scripts, ScrollRestoration, Meta, Links, useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./app.css";

// 1. Initialize Supabase Client (Browser side)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Root() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-[#141414] text-white antialiased selection:bg-red-600">
        <Navbar user={user} />
        <Outlet context={{ user }} /> {/* Child routes render here */}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function Navbar({ user }: { user: any }) {
  return (
    <nav className="fixed top-0 w-full z-[100] flex items-center justify-between px-6 md:px-12 py-4 bg-gradient-to-b from-black/90 to-transparent transition-all hover:bg-[#141414]">
      <div className="flex items-center gap-10">
        <a href="/" className="text-red-600 text-3xl font-black tracking-tighter uppercase">OpenFlix</a>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
          <a href="/" className="hover:text-white transition">Home</a>
          <a href="/search" className="hover:text-white transition">Search</a>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Simple Search Trigger */}
        <a href="/search" className="text-xl">🔍</a>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-sm"></div>
            <button onClick={() => supabase.auth.signOut()} className="text-xs hover:underline">Sign Out</button>
          </div>
        ) : (
          <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })} className="bg-red-600 px-4 py-1 rounded-sm font-bold text-sm">Sign In</button>
        )}
      </div>
    </nav>
  );
}