import { useLoaderData, Form } from "react-router";
import type { Route } from "./+types/search";
import { Link } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  if (!q) return { results: [] };

  const PROXY = import.meta.env.VITE_TMDB_BASE_URL;
  // Note: We don't use 'headers' here if you deployed with --no-verify-jwt
  // This makes the request simpler and avoids CORS drama
  const res = await fetch(`${PROXY}?path=/search/movie&query=${encodeURIComponent(q)}`);
  
  if (!res.ok) throw new Error("Search failed");

  const data = await res.json();
  return { results: data.results || [] };
}

export default function Search() {
  const { results } = useLoaderData<typeof loader>();
  const PROXY = import.meta.env.VITE_TMDB_BASE_URL;

  return (
    <div className="pt-32 px-6 md:px-12 min-h-screen bg-[#141414]">
      <div className="max-w-4xl mx-auto mb-12">
        {/* IMPORTANT: method="get" makes the URL update to ?q=... */}
        <Form method="get" className="relative">
          <input 
            type="text" 
            name="q" // <--- THIS MUST BE 'q'
            placeholder="Search for movies..." 
            className="w-full bg-zinc-800/50 border border-zinc-700 py-4 px-6 rounded-md text-white text-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          />
        </Form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
        {results.map((movie: any) => (
          <div key={movie.id} className="group cursor-pointer">
            <div className="overflow-hidden rounded-md aspect-[2/3] bg-zinc-900 shadow-lg">
            <Link to={`/movie/${movie.id}`} className="block transition-transform hover:scale-105">
                  <img 
                    src={`${PROXY}?path=/t/p/w500${movie.poster_path}`} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    loading="lazy"
                    // Fallback for missing posters
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/500x750?text=No+Image")}
                  />
            </Link>
            </div>
            <p className="mt-2 text-sm font-semibold truncate group-hover:text-red-500 transition">
              {movie.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}