import { PokedexClient } from "@/components/PokedexClient";
import { getPokemon, type Pokemon } from "@/lib/api";

export default async function Home() {
  let pokemon: Pokemon[] = [];
  let hasError = false;

  try {
    // Fetch initial list of Pokemon on server-side load
    const response = await getPokemon();
    pokemon = response.items;
  } catch {
    // Flag API load failure to show user-friendly error UI
    hasError = true;
  }

  return (
    <main className="page-shell">
      {/* Pokedex Header Banner */}
      <header className="hero">
        <div className="hero__copy">
          <p>Full-stack project</p>
          <h1>Pokedex</h1>
          <span>Next.js + FastAPI + MongoDB</span>
        </div>
        <div className="hero__device" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </header>

      {/* Conditional rendering depending on API availability status */}
      {hasError ? (
        <section className="empty-state">
          <h2>API unavailable</h2>
          <p>Run MongoDB, run the seed script, and start FastAPI at http://localhost:8000.</p>
        </section>
      ) : (
        <PokedexClient pokemon={pokemon} />
      )}
    </main>
  );
}
