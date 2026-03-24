import { useOutletContext, Link } from "react-router";
import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";

export default function MyList() {
  const { profile } = useOutletContext<{ profile: any }>();
  const [list, setList] = useState<any[]>([]);
  const PROXY = import.meta.env.VITE_TMDB_BASE_URL;

  useEffect(() => {
    if (!profile) return;
    const fetchList = async () => {
      const { data } = await supabase
        .from('watchlist')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });
      setList(data || []);
    };
    fetchList();
  }, [profile]);

  return (
    <div className="pt-32 px-6 md:px-16 min-h-screen bg-[#141414] text-white">
      <h1 className="text-4xl font-black mb-12 tracking-tight">My List</h1>
      
      {list.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {list.map((item) => (
            <Link key={item.id} to={`/movie/${item.movie_id}`} className="transition-transform hover:scale-105">
              <img 
                src={`${PROXY}?image=true&path=${item.poster_path}`} 
                className="rounded-sm w-full shadow-2xl border border-white/5" 
                alt={item.title} 
              />
              <div className="mt-3 text-xs font-bold text-gray-400 uppercase truncate">{item.title}</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-32">
          <p className="text-gray-500 text-xl italic mb-6">Your list is empty.</p>
          <Link to="/" className="bg-white text-black px-8 py-2 rounded font-bold hover:bg-gray-200 transition">Find something to add</Link>
        </div>
      )}
    </div>
  );
}