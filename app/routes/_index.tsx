import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { supabase } from "~/lib/supabase";

export default function Index() {
  const { profile } = useOutletContext<{ profile: any }>();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [top10, setTop10] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const PROXY = import.meta.env.VITE_TMDB_BASE_URL;

  useEffect(() => {
    if (!profile) return;

    const loadData = async () => {
      try {
        // 1. Fetch Watchlist from Supabase
        const { data: watchData } = await supabase
          .from('watchlist')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false });
        
        setWatchlist(watchData || []);

        // 2. Fetch TMDB Data via Proxy
        const params = new URLSearchParams({
          rating: profile.max_rating || '18',
          is_kids: String(profile.is_kids),
        });

        const [popRes, trendRes] = await Promise.all([
          fetch(`${PROXY}?path=/discover/movie&sort_by=popularity.desc&${params}`),
          fetch(`${PROXY}?path=/trending/movie/week&${params}`)
        ]);

        const pop = await popRes.json();
        const trend = await trendRes.json();

        setTop10(pop.results?.slice(0, 10) || []);
        setTrending(trend.results || []);
      } catch (err) {
        console.error("Home Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profile, PROXY]);

  if (loading) return (
    <div className="bg-[#141414] min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const hero = top10[0];

  return (
    <main className="bg-[#141414] min-h-screen pb-20 text-white font-sans overflow-x-hidden">
      {/* HERO BANNER */}
      <section className="relative h-[85vh] w-full flex items-center px-6 md:px-16">
        <div className="absolute inset-0 -z-10">
          <img 
            src={`${PROXY}?image=true&path=${hero?.backdrop_path}`} 
            className="w-full h-full object-cover brightness-[0.5]" 
            alt="" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        </div>
        <div className="max-w-3xl space-y-4">
          <h2 className="text-6xl md:text-8xl font-black uppercase italic drop-shadow-2xl leading-none">
            {hero?.title}
          </h2>
          <p className="text-lg text-gray-200 line-clamp-3 max-w-xl">{hero?.overview}</p>
          <div className="flex gap-3 pt-4">
            <Link to={`/movie/${hero?.id}`} className="bg-white text-black px-8 py-2 rounded font-bold hover:bg-white/80 transition">▶ Play</Link>
            <Link to={`/movie/${hero?.id}`} className="bg-gray-500/50 text-white px-8 py-2 rounded font-bold backdrop-blur-md hover:bg-gray-500/70">More Info</Link>
          </div>
        </div>
      </section>

      <div className="relative z-20 -mt-32 space-y-16 pl-6 md:pl-16">


        {/* ROW 2: TOP 10 (NUMBERS) */}
        <section>
          <h3 className="text-2xl font-bold mb-4">Top 10 in the UK Today</h3>
          <div className="flex gap-4 overflow-x-scroll no-scrollbar py-6">
            {top10.map((m, i) => (
              <div key={m.id} className="relative flex min-w-[220px] md:min-w-[280px] group transition-transform hover:scale-105">
                <div className="text-[180px] md:text-[220px] font-black leading-none text-outline text-[#141414] translate-x-10 select-none">
                  {i + 1}
                </div>
                <Link to={`/movie/${m.id}`} className="-ml-10 relative z-10">
                  <img src={`${PROXY}?image=true&path=${m.poster_path}`} className="h-full rounded-sm shadow-2xl" alt="" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ROW 3: TRENDING */}
        <section className="pr-16">
          <h3 className="text-2xl font-bold mb-4">Trending Now</h3>
          <div className="flex gap-3 overflow-x-scroll no-scrollbar py-2">
            {trending.map((m) => (
              <Link key={m.id} to={`/movie/${m.id}`} className="min-w-[240px] md:min-w-[300px] aspect-video transition-transform hover:scale-110">
                <img src={`${PROXY}?image=true&path=${m.backdrop_path}`} className="w-full h-full object-cover rounded-sm" alt="" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .text-outline { -webkit-text-stroke: 4px #4a4a4a; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}