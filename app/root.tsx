import { 
  Outlet, 
  Scripts, 
  ScrollRestoration, 
  Meta, 
  Links, 
  useLoaderData, 
  useNavigate, 
  Link
} from "react-router";
import { useState, useEffect, useCallback } from "react";
import "./app.css";
import { supabase } from "./lib/supabase";

/**
 * ROOT LOADER
 * Fetches the user session and all available profiles for that user.
 */
export async function loader() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return { user: null, initialProfiles: [] };

  // FIX: Query by 'user_id' (not 'id') to get all profiles for this account
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true });

  return { user: session.user, initialProfiles: profiles || [] };
}

export default function Root() {
  const { user: initialUser, initialProfiles } = useLoaderData<typeof loader>();
  const [user, setUser] = useState<any>(initialUser);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useCallback((pathURI: string) => { 
      window.location.replace(pathURI); 
    }, []);

  useEffect(() => {
    // 1. Sync the active profile from LocalStorage on load
    const syncActiveProfile = () => {
      const saved = localStorage.getItem("active_profile");
      if (saved) {
        setProfile(JSON.parse(saved));
      } else if (initialProfiles.length > 0) {
        // Fallback: If no profile is selected, prompt the profile select screen
        navigate('/profiles');
      }
    };

    syncActiveProfile();

    // 2. Listen for Auth Changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        localStorage.clear();
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [initialProfiles, navigate]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#141414] text-white antialiased selection:bg-red-600 overflow-x-hidden">
        <Navbar user={user} profile={profile} />
        
        {/* Pass user and active profile to all child routes */}
        <Outlet context={{ user, profile }} /> 
        
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/**
 * NAVBAR COMPONENT
 */
function Navbar({ user, profile }: { user: any; profile: any }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    localStorage.clear(); 
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 w-full z-[100] flex items-center justify-between px-6 md:px-12 py-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
      <div className="flex items-center gap-10">
        <Link to="/" className="text-red-600 text-3xl font-black tracking-tighter uppercase">
          OpenFlix
        </Link>
        {user && (
           <div className="hidden md:flex items-center gap-5 text-sm font-medium">
              <Link to="/list" className="hover:text-gray-300 transition">My List</Link>
              <Link to="/" className="hover:text-gray-300 transition">Popular</Link>
              <Link to="/search" className="hover:text-gray-300 transition">Search</Link>
           </div>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 group outline-none"
            >
              {/* Profile Icon: Yellow for Kids, Blue for Adults */}
              <div className={`w-8 h-8 rounded-sm ${profile?.is_kids ? 'bg-yellow-500' : 'bg-blue-600'} transition-transform group-hover:scale-110 overflow-hidden`}>
                 <img src={profile?.avatar_url || "/avatar.png"} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] text-white group-hover:underline">▼</span>
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute top-full right-0 mt-4 w-56 bg-black/95 border border-white/10 shadow-2xl rounded-sm py-2 animate-in fade-in zoom-in duration-150">
                  <div className="px-4 py-3 border-b border-white/10 mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account</p>
                    <p className="text-sm truncate font-medium">{user.email}</p>
                    <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">
                      {profile?.is_kids ? "Kids Mode Active" : `Maturity: ${profile?.max_rating || '18'}`}
                    </p>
                  </div>
                  
                  <Link 
                    to="/profiles" 
                    onClick={() => {setIsDropdownOpen(false); localStorage.removeItem("active_profile")}}
                    className="block px-4 py-2 text-sm hover:bg-white/10 transition"
                  >
                    Manage Profiles
                  </Link>
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition mt-2 border-t border-white/10"
                  >
                    Sign out of OpenFlix
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/login" className="bg-red-600 px-4 py-1.5 rounded-sm font-bold text-sm hover:bg-red-700 transition">Sign In</Link>
        )}
      </div>
    </nav>
  );
}