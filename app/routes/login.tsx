import { useState } from "react";
import { supabase } from "~/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const providerMeta: Record<string, { domain: string; label: string }> = {
    apple: { domain: "apple.com", label: "Apple" },
    azure: { domain: "azure.microsoft.com", label: "Azure" },
    bitbucket: { domain: "bitbucket.org", label: "Bitbucket" },
    discord: { domain: "discord.com", label: "Discord" },
    facebook: { domain: "facebook.com", label: "Facebook" },
    figma: { domain: "figma.com", label: "Figma" },
    gitlab: { domain: "gitlab.com", label: "GitLab" },
    github: { domain: "github.com", label: "GitHub" },
    google: { domain: "google.com", label: "Google" },
    kakao: { domain: "kakaocorp.com", label: "Kakao" },
    keycloak: { domain: "keycloak.org", label: "Keycloak" },
    linkedin: { domain: "linkedin.com", label: "LinkedIn" },
    notion: { domain: "notion.so", label: "Notion" },
    twitch: { domain: "twitch.tv", label: "Twitch" },
    x: { domain: "x.com", label: "X" },
    slack: { domain: "slack.com", label: "Slack" },
    spotify: { domain: "spotify.com", label: "Spotify" },
    workos: { domain: "workos.com", label: "WorkOS" },
    zoom: { domain: "zoom.us", label: "Zoom" },
  };

  const enabledProviders = (import.meta.env.VITE_ENABLED_AUTH_PROVIDERS || "")
    .split(",")
    .map((p: string) => p.trim().toLowerCase())
    .filter(Boolean);

  const handleOAuth = async (provider: any) => {
    await supabase.auth.signInWithOAuth({ 
      provider,
      options: { redirectTo: `${window.location.origin}/` }
    });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) { 
        await supabase.auth.signUp({email, password: pass});
        alert("Check your email or try signing in again.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/login-bg.jpg')] bg-cover bg-center">
      <div className="bg-black/85 p-10 md:p-14 rounded-md w-full max-w-lg border border-white/10 shadow-2xl backdrop-blur-md">
        <h1 className="text-3xl font-bold text-white mb-8">Sign In</h1>
        
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-10">
          <input 
            className="w-full p-4 bg-[#333] rounded text-white outline-none focus:ring-2 focus:ring-red-600 transition"
            type="email" placeholder="Email" required onChange={e => setEmail(e.target.value)} 
          />
          <input 
            className="w-full p-4 bg-[#333] rounded text-white outline-none focus:ring-2 focus:ring-red-600 transition"
            type="password" placeholder="Password" required onChange={e => setPass(e.target.value)} 
          />
          <button type="submit" className="w-full bg-red-600 py-3 rounded font-bold text-lg hover:bg-red-700 transition mt-4 active:scale-[0.98]">
            Sign In
          </button>
        </form>

        {enabledProviders.length > 0 && (
          <div className="pt-8 border-t border-white/20 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-6 font-bold">Quick Connect</p>
            
            {/* FLEX CONTAINER: Centered and wrapping */}
            <div className="flex flex-wrap justify-center gap-4">
              {enabledProviders.map((provider: string) => {
                const meta = providerMeta[provider] || { domain: `${provider}.com`, label: provider };
                return (
                  <button 
                    key={provider}
                    title={meta.label}
                    onClick={() => handleOAuth(provider)} 
                    // Fixed width/height ensures they look like a grid, but flex-wrap + justify-center handles the alignment
                    className="w-[52px] h-[52px] flex items-center justify-center bg-white rounded-lg hover:bg-white transition-all group active:scale-90 border border-white/5"
                  >
                    <img 
                      src={`https://www.google.com/s2/favicons?sz=64&domain=${meta.domain}`} 
                      className="w-6 h-6 object-contain group-hover:scale-110 transition-transform"
                      alt={meta.label} 
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}