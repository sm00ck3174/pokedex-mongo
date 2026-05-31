"use client";

import { useMemo, useState } from "react";

import { PokemonCard } from "@/components/PokemonCard";
import type { Pokemon } from "@/lib/api";

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
];

export function PokedexClient({ pokemon }: { pokemon: Pokemon[] }) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const filteredPokemon = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pokemon.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.includes(query) ||
        item.number.toString().padStart(3, "0").includes(query);
      const matchesType = selectedType === "all" || item.types.includes(selectedType);

      return matchesSearch && matchesType;
    });
  }, [pokemon, search, selectedType]);

  return (
    <>
      <section className="pokedex-panel" aria-label="Filtros da Pokedex">
        <div className="pokedex-panel__screen">
          <div className="scanner-light" />
          <div>
            <span className="panel-label">Kanto Dex</span>
            <strong>{filteredPokemon.length.toString().padStart(3, "0")}</strong>
          </div>
        </div>

        <div className="filters">
          <label>
            Buscar
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="nome ou numero"
            />
          </label>

          <label>
            Tipo
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "todos" : type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="pokemon-grid" aria-label="Lista de Pokemon">
        {filteredPokemon.map((item) => (
          <PokemonCard key={item.number} pokemon={item} />
        ))}
      </section>
    </>
  );
}
