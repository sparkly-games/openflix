import { useLoaderData, Link, useOutletContext } from "react-router";
import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import type { Route } from "./+types/movie-details";

export async function loader({ params }: Route.LoaderArgs) {
  const PROXY = import.meta.env.VITE_TMDB_BASE_URL;
  const mid = params.id;

  const [detRes, vidRes, crRes, simRes] = await Promise.all([
    fetch(`${PROXY}?path=/movie/${mid}`),
    fetch(`${PROXY}?path=/movie/${mid}/videos`),
    fetch(`${PROXY}?path=/movie/${mid}/credits`),
    fetch(`${PROXY}?path=/movie/${mid}/similar`)
  ]);

  return { 
    movie: await detRes.json(), 
    videos: await vidRes.json(), 
    cast: (await crRes.json()).cast?.slice(0, 6),
    similar: (await simRes.json()).results?.slice(0, 12)
  };
}

export default function MovieDetails() {
  const { movie, videos, cast, similar } = useLoaderData<typeof loader>();
  const { profile } = useOutletContext<{ profile: any }>();
  const [showTrailer, setShowTrailer] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const PROXY = import.meta.env.VITE_TMDB_BASE_URL;

  const trailer = videos.results?.find((v: any) => v.type === "Trailer");

  useEffect(() => {
    if (!profile) return;
    const checkStatus = async () => {
      const { data } = await supabase.from('watchlist').select('id').eq('profile_id', profile.id).eq('movie_id', movie.id.toString()).maybeSingle();
      setIsSaved(!!data);
    };
    checkStatus();
  }, [profile, movie.id]);

  const toggleWatchlist = async () => {
    if (isSaved) {
      await supabase.from('watchlist').delete().eq('profile_id', profile.id).eq('movie_id', movie.id.toString());
      setIsSaved(false);
    } else {
      await supabase.from('watchlist').insert({
        profile_id: profile.id, movie_id: movie.id.toString(), title: movie.title, poster_path: movie.poster_path
      });
      setIsSaved(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white overflow-x-hidden">
      
      {/* CINEMATIC BANNER */}
      <section 
        className="relative w-full flex items-center px-6 md:px-16 lg:px-24"
        style={{
          height: '85vh',
          backgroundImage: `linear-gradient(to right, #141414 10%, rgba(20, 20, 20, 0.2) 50%, transparent 100%), 
                            linear-gradient(to top, #141414 0%, transparent 50%),
                            url(${PROXY}?image=true&path=${movie.backdrop_path})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* The image is now the background of the section itself, so it CANNOT be hidden or 0px */}
        
        <div className="max-w-4xl space-y-6 pt-20 z-10">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-red-600">
            <span className="bg-red-600 h-1 w-8 block"></span>
            <span>Feature Film</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase italic leading-[0.85] tracking-tighter drop-shadow-2xl">
            {movie.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-lg font-bold">
            <span className="text-green-500">{Math.round(movie.vote_average * 10)}% Match</span>
            <span className="text-gray-400">{movie.release_date?.split('-')[0]}</span>
            <span className="bg-zinc-800 text-gray-300 px-2 py-0.5 rounded text-[10px] tracking-widest uppercase border border-white/10">4K Ultra HD</span>
          </div>

          <p className="text-xl text-gray-200 max-w-2xl line-clamp-4 leading-relaxed drop-shadow-lg">
            {movie.overview}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => setShowTrailer(!showTrailer)} 
              className="bg-white text-black px-10 py-3 rounded font-black text-xl hover:bg-white/80 transition active:scale-95 shadow-2xl flex items-center gap-2"
            >
              <span className="text-2xl">{showTrailer ? "✕" : "▶"}</span> 
              {showTrailer ? "Watch Trailer" : "Watch Trailer"}
            </button>
            
            <button 
              onClick={toggleWatchlist} 
              className={`px-10 py-3 rounded font-black text-xl backdrop-blur-md border border-white/20 transition active:scale-95 flex items-center gap-2 ${
                isSaved ? "bg-white text-black" : "bg-zinc-800/60 text-white hover:bg-zinc-700"
              }`}
            >
              <span className="text-2xl">{isSaved ? "✓" : "+"}</span> 
              {isSaved ? "In My List" : "My List"}
            </button>
          </div>
        </div>
      </section>

      {/* TRAILER */}
      <div className={`transition-all duration-700 overflow-hidden ${showTrailer ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="aspect-video w-full max-w-5xl mx-auto p-4 md:p-12">
          {trailer && (
            <iframe 
              className="w-full h-full rounded-xl" 
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=${showTrailer ? 1 : 0}`} 
              allowFullScreen 
              suppressHydrationWarning={true}
            />
          )}
        </div>
      </div>
      
      {/* GRID CONTENT */}
      <div className="px-6 md:px-16 py-20">
         <h3 className="text-2xl font-bold mb-10 text-gray-400 uppercase tracking-widest italic">More Like This</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similar.map((s: any) => (
              <Link key={s.id} to={`/movie/${s.id}`} className="group relative aspect-video rounded-lg overflow-hidden bg-zinc-900 transition-transform hover:scale-105">
                <img src={`${PROXY}?image=true&path=${s.backdrop_path}`} crossOrigin="anonymous" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-4">
                  <p className="font-black uppercase text-sm truncate">{s.title}</p>
                </div>
              </Link>
            ))}
          </div>
      </div>
    </div>
  );
}