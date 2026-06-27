import Image from "next/image";

import type { Pokemon } from "@/lib/api";

const typeLabels: Record<string, string> = {
  bug: "Inseto",
  dark: "Sombrio",
  dragon: "Dragao",
  electric: "Eletrico",
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
  psychic: "Psiquico",
  rock: "Pedra",
  steel: "Metal",
  water: "Agua",
};

export function PokemonCard({ pokemon, onClick }: { pokemon: Pokemon; onClick?: () => void }) {
  const mainType = pokemon.types[0] ?? "normal";
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
      <div className="pokemon-card__topline">
        <span>#{pokemon.number.toString().padStart(3, "0")}</span>
        <span>{statTotal} pts</span>
      </div>

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

      <div className="pokemon-card__content">
        <h2>{pokemon.name}</h2>
        <div className="pokemon-card__types">
          {pokemon.types.map((type) => (
            <span key={type}>{typeLabels[type] ?? type}</span>
          ))}
        </div>
        <dl className="pokemon-card__facts">
          <div>
            <dt>Altura</dt>
            <dd>{(pokemon.height / 10).toFixed(1)} m</dd>
          </div>
          <div>
            <dt>Peso</dt>
            <dd>{(pokemon.weight / 10).toFixed(1)} kg</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
