"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { PokemonCard } from "@/components/PokemonCard";
import { getPokemon, type Pokemon } from "@/lib/api";

// Available Pokemon types for filtering
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

// Mapping of types to localized English labels
const typeLabels: Record<string, string> = {
  all: "All",
  bug: "Bug",
  dark: "Dark",
  dragon: "Dragon",
  electric: "Electric",
  fairy: "Fairy",
  fighting: "Fighting",
  fire: "Fire",
  flying: "Flying",
  ghost: "Ghost",
  grass: "Grass",
  ground: "Ground",
  ice: "Ice",
  normal: "Normal",
  poison: "Poison",
  psychic: "Psychic",
  rock: "Rock",
  steel: "Steel",
  water: "Water",
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

    // Fetch filtered and sorted Pokemon from the API
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
        console.error("Error filtering pokémon:", err);
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
      {/* Control panel containing search input, type filters, and sort options */}
      <section className="pokedex-panel" aria-label="Pokedex Filters" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 320px) 1fr", gap: "18px", width: "100%" }}>
          {/* Top screen display counter */}
          <div className="pokedex-panel__screen">
            <div className="scanner-light" />
            <div>
              <span className="panel-label">Kanto Dex</span>
              <strong>{pokemon.length.toString().padStart(3, "0")}</strong>
            </div>
          </div>

          {/* Filtering and Sorting forms */}
          <div className="filters" style={{ gridTemplateColumns: "1fr 1fr 0.7fr" }}>
            <label>
              Search
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="name or number"
              />
            </label>

            <label>
              Sort by
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="number">Number</option>
                <option value="name">Name</option>
                <option value="total_stats">Total Stats</option>
                <option value="hp">HP</option>
                <option value="attack">Attack</option>
                <option value="defense">Defense</option>
                <option value="speed">Speed</option>
                <option value="height">Height</option>
                <option value="weight">Weight</option>
              </select>
            </label>

            <label>
              Order
              <select value={order} onChange={(event) => setOrder(event.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
          </div>
        </div>

        {/* Type Filter Buttons */}
        <div style={{ width: "100%" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "bold", textTransform: "uppercase", color: "var(--muted)", display: "block", marginBottom: "8px" }}>
            Filter by Type:
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

      {/* Main Grid display of Pokemon cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", fontSize: "1.2rem", fontWeight: "bold" }}>
          Loading Pokémon list...
        </div>
      ) : (
        <section className="pokemon-grid" aria-label="Pokemon List">
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
