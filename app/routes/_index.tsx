import { useLoaderData, useOutletContext } from "react-router";
import type { Route } from "./+types/_index";
import { Link } from "react-router";

/**
 * SERVER-SIDE LOADER
 * This fetches the data through your Supabase Proxy so the 
 * school firewall never sees the TMDB requests.
 */
export async function loader({ params }: Route.LoaderArgs) {
  const PROXY_URL = import.meta.env.VITE_TMDB_BASE_URL;

  // Fetch Popular and New (Upcoming) movies in parallel
  const [popularRes, upcomingRes] = await Promise.all([
    fetch(`${PROXY_URL}?path=/movie/popular`),
    fetch(`${PROXY_URL}?path=/movie/upcoming`),
  ]);

  if (!popularRes.ok || !upcomingRes.ok) {
    throw new Error("Could not fetch movies from proxy server.");
  }

  const popularData = await popularRes.json();
  const upcomingData = await upcomingRes.json();

  return {
    popular: popularData.results.slice(0, 10),
    newest: upcomingData.results.slice(0, 10),
  };
}

export default function Home() {
  const { popular, newest } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<{ user: any }>(); // Access auth state from root.tsx
  
  const PROXY_URL = import.meta.env.VITE_TMDB_BASE_URL;
  const heroMovie = popular[0]; // Use the top trending movie for the banner

  return (
    <main className="pb-20">
      {/* 1. HERO BANNER */}
      <section className="relative h-[85vh] w-full flex items-center px-6 md:px-12">
        {/* Background Image Container */}
        <div className="absolute inset-0 -z-10">
          <img
            src={`${PROXY_URL}?path=/t/p/original${heroMovie.backdrop_path}`}
            alt=""
            className="w-full h-full object-cover brightness-[0.5]"
          />
          {/* Bottom Fade Gradient to blend with rows */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        </div>

        {/* Hero Text Content */}
        <div className="max-w-2xl space-y-4 pt-20">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
            {heroMovie.title}
          </h2>
          <p className="text-sm md:text-lg text-gray-200 line-clamp-3 font-medium drop-shadow-md">
            {heroMovie.overview}
          </p>
          
          <div className="flex gap-3 pt-4">
            <button className="flex items-center gap-2 bg-white text-black px-8 py-2.5 rounded-md font-bold text-lg hover:bg-white/80 transition shadow-lg">
              <span>▶</span> Play
            </button>
            <button className="flex items-center gap-2 bg-gray-500/40 text-white px-8 py-2.5 rounded-md font-bold text-lg backdrop-blur-md hover:bg-gray-500/60 transition shadow-lg">
              <span>ⓘ</span> More Info
            </button>
          </div>
        </div>
      </section>

      {/* 2. MOVIE ROWS */}
      <div className="relative z-20 -mt-32 space-y-12 flex flex-col gap-4">
        <MovieRow 
          title="Popular on OpenFlix" 
          movies={popular} 
          proxy={PROXY_URL} 
        />
        
        <MovieRow 
          title={user ? `Recommendations for You` : "New Releases"} 
          movies={newest} 
          proxy={PROXY_URL} 
        />
      </div>
    </main>
  );
}

/**
 * REUSABLE MOVIE ROW
 * Handles the horizontal scroll and proxied posters.
 */
function MovieRow({ title, movies, proxy }: { title: string; movies: any[]; proxy: string }) {
  return (
    <div className="px-6 md:px-12 group">
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-200 group-hover:text-white transition duration-300">
        {title}
      </h3>
      
      {/* Scrollable Container */}
      <div className="flex gap-2 overflow-x-scroll no-scrollbar scroll-smooth py-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="relative min-w-[160px] md:min-w-[230px] aspect-[2/3] transition-all duration-300 hover:scale-110 hover:z-40 cursor-pointer rounded-sm overflow-hidden"
          >
            <Link to={`/movie/${movie.id}`} className="block transition-transform hover:scale-105">
              <img 
                src={`${proxy}?path=/t/p/w500${movie.poster_path}`} 
                alt={movie.title}
                className="rounded-sm shadow-lg"
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}