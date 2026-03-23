import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/movie-details";

export async function loader({ params }: Route.LoaderArgs) {
  const PROXY = import.meta.env.VITE_TMDB_BASE_URL;
  const mid = params.id;

  // Parallel fetch: Details, Videos, Credits, and Similar movies
  const [detRes, vidRes, crRes, simRes] = await Promise.all([
    fetch(`${PROXY}?path=/movie/${mid}`),
    fetch(`${PROXY}?path=/movie/${mid}/videos`),
    fetch(`${PROXY}?path=/movie/${mid}/credits`),
    fetch(`${PROXY}?path=/movie/${mid}/similar`)
  ]);

  if (!detRes.ok) throw new Error("Movie not found");

  const movie = await detRes.json();
  const videos = await vidRes.json();
  const credits = await crRes.json();
  const similar = await simRes.json();

  // Filter for the main Trailer
  const trailer = videos.results?.find(
    (v: any) => v.type === "Trailer" && v.site === "YouTube"
  );

  return { 
    movie, 
    trailerKey: trailer?.key, 
    cast: credits.cast?.slice(0, 6),
    similar: similar.results?.slice(0, 6)
  };
}

export default function MovieDetails() {
  const { movie, trailerKey, cast, similar } = useLoaderData<typeof loader>();
  const PROXY = import.meta.env.VITE_TMDB_BASE_URL;

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-[70vh] w-full flex items-end pb-12 px-6 md:px-12">
        <div className="absolute inset-0 -z-10">
          <img 
            src={`${PROXY}?path=/t/p/original${movie.backdrop_path}`} 
            className="w-full h-full object-cover brightness-[0.3]" 
            alt="" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        </div>
        
        <div className="flex flex-col md:flex-row gap-10 items-end w-full">
          <img 
            src={`${PROXY}?path=/t/p/w500${movie.poster_path}`} 
            className="hidden md:block w-64 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" 
            alt={movie.title} 
          />
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none italic">
              {movie.title}
            </h1>
            
            <div className="flex items-center gap-5 text-lg font-bold">
              <span className="text-green-500">{Math.round(movie.vote_average * 10)}% Match</span>
              <span className="text-gray-400">{movie.release_date?.split('-')[0]}</span>
              <span className="bg-zinc-800 text-gray-300 px-2 py-0.5 rounded text-xs tracking-widest uppercase">4K Ultra HD</span>
            </div>

            <p className="max-w-3xl text-gray-200 text-lg leading-relaxed line-clamp-4">
              {movie.overview}
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT GRID */}
      <div className="px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-4 gap-16">
        
        {/* Left Column: Trailer & Cast */}
        <div className="lg:col-span-3 space-y-20">
          
          {/* TRAILER SECTION */}
          {trailerKey ? (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold border-l-4 border-red-600 pl-4 uppercase tracking-tighter text-gray-400">Trailer</h3>
              <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-2xl group border border-white/5">
                <iframe 
                  className="w-full h-full" 
                  src={`https://www.youtube.com/embed/${trailerKey}?rel=0&modestbranding=1&autohide=1`} 
                  title="Official Trailer"
                  allowFullScreen 
                />
              </div>
            </div>
          ) : (
            <div className="h-64 bg-zinc-900/50 rounded-xl flex items-center justify-center border border-dashed border-zinc-800">
              <p className="text-zinc-600 font-medium italic">No trailer available for this title.</p>
            </div>
          )}

          {/* CAST SECTION */}
          <section className="space-y-8">
            <h3 className="text-2xl font-bold border-l-4 border-red-600 pl-4 uppercase tracking-tighter text-gray-400">Top Cast</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {cast.map((actor: any) => (
                <div key={actor.id} className="text-center group">
                  <div className="aspect-square rounded-full overflow-hidden mb-4 ring-2 ring-transparent group-hover:ring-red-600 transition-all duration-300 shadow-xl">
                    <img 
                      src={`${PROXY}?path=/t/p/w200${actor.profile_path}`} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={actor.name} 
                    />
                  </div>
                  <h4 className="text-sm font-bold text-gray-100">{actor.name}</h4>
                  <p className="text-xs text-gray-500 italic mt-1">{actor.character}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Meta Info & Similar Movies */}
        <aside className="space-y-12">
           <div className="bg-zinc-900/30 p-8 rounded-2xl border border-white/5 space-y-8 backdrop-blur-sm">
              <div className="space-y-2">
                <h4 className="text-gray-500 text-xs font-black uppercase tracking-widest">User Rating</h4>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-yellow-500">{movie.vote_average.toFixed(1)}</span>
                  <span className="text-gray-600 text-sm mb-1">/ 10</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-gray-500 text-xs font-black uppercase tracking-widest">Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {movie.genres?.map((g: any) => (
                    <span key={g.id} className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
           </div>

           <section className="space-y-6">
             <h4 className="text-gray-500 text-xs font-black uppercase tracking-widest px-2 italic">More Like This</h4>
             <div className="grid grid-cols-2 gap-4">
               {similar.map((s: any) => (
                 <Link 
                   key={s.id} 
                   to={`/movie/${s.id}`} 
                   className="hover:scale-105 transition-all duration-300 hover:z-10 group"
                 >
                   <img 
                     src={`${PROXY}?path=/t/p/w200${s.poster_path}`} 
                     className="rounded shadow-lg border border-white/5" 
                     alt="" 
                   />
                   <div className="mt-2 text-[10px] font-bold truncate group-hover:text-red-600 transition-colors uppercase">
                     {s.title}
                   </div>
                 </Link>
               ))}
             </div>
           </section>
        </aside>

      </div>
    </div>
  );
}