import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";

export default function Profiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [view, setView] = useState<"select" | "manage" | "form">("select");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  
  // Form States
  const [name, setName] = useState("");
  const [isKids, setIsKids] = useState(false);
  const [rating, setRating] = useState("18");

  const navigate = useNavigate();

  const fetchProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate("/login");
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    if (data) setProfiles(data);
  };

  useEffect(() => { fetchProfiles(); }, []);

  // Handle clicking a profile based on current view
  const handleProfileClick = (p: any) => {
    if (view === "manage") {
      setSelectedProfile(p);
      setName(p.name);
      setIsKids(p.is_kids);
      setRating(p.max_rating);
      setView("form");
    } else {
      localStorage.setItem("active_profile", JSON.stringify(p));
      window.location.href = "/";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !name.trim()) return;

    const profileData = {
      user_id: user.id,
      name,
      is_kids: isKids,
      max_rating: isKids ? "PG" : rating, // Force PG if Kids is checked
      avatar_url: "/avatar.png"
    };

    const { error } = selectedProfile 
      ? await supabase.from('profiles').update(profileData).eq('id', selectedProfile.id)
      : await supabase.from('profiles').insert([profileData]);

    if (!error) {
      setView("select");
      setSelectedProfile(null);
      fetchProfiles();
    }
  };

  const handleDelete = async () => {
    if (!selectedProfile || !confirm("Delete this profile?")) return;
    await supabase.from('profiles').delete().eq('id', selectedProfile.id);
    setView("select");
    setSelectedProfile(null);
    fetchProfiles();
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center p-4">
      
      {/* 1. SELECTION & MANAGE VIEW */}
      {(view === "select" || view === "manage") && (
        <div className="text-center">
          <h1 className="text-5xl mb-10 font-medium">
            {view === "manage" ? "Manage Profiles:" : "Who's watching?"}
          </h1>
          <div className="flex flex-wrap justify-center gap-6">
            {profiles.map((p) => (
              <div key={p.id} onClick={() => handleProfileClick(p)} className="group cursor-pointer flex flex-col items-center gap-3">
                <div className="relative w-32 h-32 md:w-40 md:h-40">
                  <img src={p.avatar_url} className={`rounded-md border-4 border-transparent group-hover:border-white transition ${view === "manage" ? "brightness-50" : ""}`} />
                  {view === "manage" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="border border-white rounded-full p-2">✎</span>
                    </div>
                  )}
                </div>
                <span className="text-gray-400 group-hover:text-white">{p.name}</span>
              </div>
            ))}
            {view === "select" && profiles.length < 5 && (
              <button onClick={() => { setSelectedProfile(null); setName(""); setIsKids(false); setView("form"); }} className="flex flex-col items-center gap-3 group">
                <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-transparent flex items-center justify-center text-5xl text-gray-500 group-hover:bg-gray-300 group-hover:text-black transition">+</div>
                <span className="text-gray-400 group-hover:text-white">Add Profile</span>
              </button>
            )}
          </div>
          <button 
            onClick={() => setView(view === "select" ? "manage" : "select")}
            className="mt-12 border border-gray-500 px-6 py-1.5 text-gray-500 hover:border-white hover:text-white transition uppercase tracking-widest text-sm"
          >
            {view === "manage" ? "Done" : "Manage Profiles"}
          </button>
        </div>
      )}

      {/* 2. ADD/EDIT FORM */}
      {view === "form" && (
        <div className="max-w-xl w-full animate-in fade-in duration-300">
          <h1 className="text-5xl font-medium mb-8 border-b border-white/10 pb-4">
            {selectedProfile ? "Edit Profile" : "Add Profile"}
          </h1>
          <div className="flex gap-6 py-6 border-b border-white/10">
            <img src="/avatar.png" className="w-28 h-28 rounded-md" />
            <div className="flex-1 space-y-4">
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#666] p-2 outline-none focus:bg-[#777]" placeholder="Name" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isKids} onChange={(e) => setIsKids(e.target.checked)} className="w-5 h-5 accent-red-600" />
                <span>Kid?</span>
              </label>
              
              {/* Maturity Logic: Hidden if Kid is checked */}
              {!isKids && (
                <div className="pt-2">
                  <p className="text-xs text-gray-400 mb-1">MATURITY RATING:</p>
                  <select value={rating} onChange={(e) => setRating(e.target.value)} className="bg-[#333] p-1 border border-white/20">
                    <option value="U">U</option>
                    <option value="PG">PG</option>
                    <option value="12">12</option>
                    <option value="15">15</option>
                    <option value="18">18</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={handleSave} className="bg-white text-black px-6 py-1.5 font-bold hover:bg-red-600 hover:text-white">SAVE</button>
            <button onClick={() => setView("select")} className="border border-gray-500 px-6 py-1.5 text-gray-500 hover:text-white">CANCEL</button>
            {selectedProfile && (
              <button onClick={handleDelete} className="ml-auto border border-red-600 px-6 py-1.5 text-red-600 hover:bg-red-600 hover:text-white">DELETE</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}