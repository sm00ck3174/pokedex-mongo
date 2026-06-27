import Image from "next/image";

import type { Pokemon } from "@/lib/api";

// Mapping of types to localized English labels
const typeLabels: Record<string, string> = {
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

export function PokemonCard({ pokemon, onClick }: { pokemon: Pokemon; onClick?: () => void }) {
  const mainType = pokemon.types[0] ?? "normal";
  
  // Calculate cumulative stat total for the card banner
  const statTotal = Object.values(pokemon.stats).reduce((total, stat) => total + stat, 0);

  return (
    <article
      className={`pokemon-card type-${mainType}`}
      onClick={onClick}
      style={{ cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 22px 48px rgba(0, 0, 0, 0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 18px 40px rgba(0, 0, 0, 0.22)";
      }}
    >
      {/* Top Header Row with ID number and Stats Total */}
      <div className="pokemon-card__topline">
        <span>#{pokemon.number.toString().padStart(3, "0")}</span>
        <span>{statTotal} pts</span>
      </div>

      {/* Official Artwork Display */}
      <div className="pokemon-card__image">
        {pokemon.imageUrl ? (
          <Image
            src={pokemon.imageUrl}
            alt={pokemon.name}
            width={220}
            height={220}
            priority={pokemon.number <= 12}
          />
        ) : null}
      </div>

      {/* Details Footer: Name, Types and Heights/Weights */}
      <div className="pokemon-card__content">
        <h2>{pokemon.name}</h2>
        <div className="pokemon-card__types">
          {pokemon.types.map((type) => (
            <span key={type}>{typeLabels[type] ?? type}</span>
          ))}
        </div>
        <dl className="pokemon-card__facts">
          <div>
            <dt>Height</dt>
            <dd>{(pokemon.height / 10).toFixed(1)} m</dd>
          </div>
          <div>
            <dt>Weight</dt>
            <dd>{(pokemon.weight / 10).toFixed(1)} kg</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
