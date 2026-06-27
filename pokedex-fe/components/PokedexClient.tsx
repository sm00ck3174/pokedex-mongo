"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PokemonCard } from "@/components/PokemonCard";
import { getPokemon, type Pokemon } from "@/lib/api";

const typeOptions = [
  "all",
  "grass",
  "fire",
  "water",
  "electric",
  "psychic",
  "normal",
  "poison",
  "flying",
  "bug",
  "ground",
  "rock",
  "fighting",
  "ghost",
  "ice",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

const typeLabels: Record<string, string> = {
  all: "todos",
  bug: "Inseto",
  dark: "Sombrio",
  dragon: "Dragão",
  electric: "Elétrico",
  fairy: "Fada",
  fighting: "Lutador",
  fire: "Fogo",
  flying: "Voador",
  ghost: "Fantasma",
  grass: "Grama",
  ground: "Terra",
  ice: "Gelo",
  normal: "Normal",
  poison: "Veneno",
  psychic: "Psíquico",
  rock: "Pedra",
  steel: "Metal",
  water: "Água",
};

export function PokedexClient({ pokemon: initialPokemon }: { pokemon: Pokemon[] }) {
  const router = useRouter();
  const [pokemon, setPokemon] = useState<Pokemon[]>(initialPokemon);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("number");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getPokemon({
      search,
      type: selectedType,
      sortBy,
      order,
    })
      .then((data) => {
        if (active) {
          setPokemon(data.items);
        }
      })
      .catch((err) => {
        console.error("Erro ao filtrar pokémon:", err);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [search, selectedType, sortBy, order]);

  return (
    <>
      <section className="pokedex-panel" aria-label="Filtros da Pokedex" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 320px) 1fr", gap: "18px", width: "100%" }}>
          <div className="pokedex-panel__screen">
            <div className="scanner-light" />
            <div>
              <span className="panel-label">Kanto Dex</span>
              <strong>{pokemon.length.toString().padStart(3, "0")}</strong>
            </div>
          </div>

          <div className="filters" style={{ gridTemplateColumns: "1fr 1fr 0.7fr" }}>
            <label>
              Buscar
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="nome ou numero"
              />
            </label>

            <label>
              Ordenar por
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="number">Número</option>
                <option value="name">Nome</option>
                <option value="total_stats">Total de Stats</option>
                <option value="hp">HP</option>
                <option value="attack">Ataque</option>
                <option value="defense">Defesa</option>
                <option value="speed">Velocidade</option>
                <option value="height">Altura</option>
                <option value="weight">Peso</option>
              </select>
            </label>

            <label>
              Ordem
              <select value={order} onChange={(event) => setOrder(event.target.value)}>
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </label>
          </div>
        </div>

        <div style={{ width: "100%" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: "8px" }}>
            Filtrar por Tipo:
          </span>
          <div className="type-buttons-container" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {typeOptions.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`type-btn type-${type} ${selectedType === type ? "active" : ""}`}
              >
                {typeLabels[type] ?? type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", fontSize: "1.2rem", fontWeight: "bold" }}>
          Carregando lista de Pokémon...
        </div>
      ) : (
        <section className="pokemon-grid" aria-label="Lista de Pokemon">
          {pokemon.map((item) => (
            <PokemonCard
              key={item.number}
              pokemon={item}
              onClick={() => router.push(`/pokemon/${item.number}`)}
            />
          ))}
        </section>
      )}
    </>
  );
}
