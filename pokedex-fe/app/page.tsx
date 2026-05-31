import { PokedexClient } from "@/components/PokedexClient";
import { getPokemon, type Pokemon } from "@/lib/api";

export default async function Home() {
  let pokemon: Pokemon[] = [];
  let hasError = false;

  try {
    const response = await getPokemon();
    pokemon = response.items;
  } catch {
    hasError = true;
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <div className="hero__copy">
          <p>Projeto full stack</p>
          <h1>Pokedex</h1>
          <span>Next.js + FastAPI + MongoDB</span>
        </div>
        <div className="hero__device" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </header>

      {hasError ? (
        <section className="empty-state">
          <h2>API indisponivel</h2>
          <p>Rode o MongoDB, execute o seed e inicie o FastAPI em http://localhost:8000.</p>
        </section>
      ) : (
        <PokedexClient pokemon={pokemon} />
      )}
    </main>
  );
}
