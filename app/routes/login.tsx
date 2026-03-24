import { useState } from "react";
import { supabase } from "~/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  // Get the providers from .env and clean them up
  const enabledProviders = (import.meta.env.VITE_ENABLED_AUTH_PROVIDERS || "")
    .split(",")
    .map((p: string) => p.trim().toLowerCase())
    .filter(Boolean);

  const handleOAuth = async (provider: any) => {
    await supabase.auth.signInWithOAuth({ 
      provider,
      options: { redirectTo: window.location.origin }
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) { supabase.auth.signUp({email: email, password: pass}) }
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/login-bg.jpg')] bg-cover bg-center">
      <div className="bg-black/80 p-12 md:p-16 rounded-md w-full max-w-md border border-white/10 shadow-2xl backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>
        
        {/* Email Login Section */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-8">
          <input 
            className="w-full p-4 bg-[#333] rounded text-white outline-none focus:bg-[#444] transition"
            type="email" placeholder="Email" required onChange={e => setEmail(e.target.value)} 
          />
          <input 
            className="w-full p-4 bg-[#333] rounded text-white outline-none focus:bg-[#444] transition"
            type="password" placeholder="Password" required onChange={e => setPass(e.target.value)} 
          />
          <button type="submit" className="w-full bg-red-600 py-3 rounded font-bold text-lg hover:bg-red-700 transition mt-4">
            Sign In
          </button>
        </form>

        {/* Dynamic Provider Buttons */}
        {enabledProviders.length > 0 && (
          <div className="flex flex-col gap-3 pt-6 border-t border-white/20">
            <p className="text-gray-400 text-sm text-center mb-2">Or continue with</p>
            {enabledProviders.map((provider: string) => (
              <button 
                key={provider}
                onClick={() => handleOAuth(provider)} 
                className="flex items-center justify-center gap-3 bg-white text-black py-2.5 rounded font-bold capitalize hover:bg-gray-200 transition"
              >
                {/* Simple Icon Logic */}
                {provider === 'google' && <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />}
                {provider === 'github' && <span className="text-lg">GitHub</span>}
                {provider === 'gitlab' && <span className="text-lg">GitLab</span>}
                {provider !== 'google' && provider !== 'github' && provider !== 'gitlab' && provider}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}