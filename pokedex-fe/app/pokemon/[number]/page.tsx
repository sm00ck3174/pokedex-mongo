"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getPokemonDetails, type PokemonDetails } from "@/lib/api";

const typeLabels: Record<string, string> = {
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

export default function PokemonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const numberParam = params?.number;
  const pokemonNumber = typeof numberParam === "string" ? parseInt(numberParam, 10) : NaN;

  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(pokemonNumber)) {
      setError("Número de Pokémon inválido.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getPokemonDetails(pokemonNumber)
      .then((data) => {
        if (active) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar detalhes:", err);
        if (active) {
          setError(`Não foi possível carregar os detalhes deste Pokémon: ${err instanceof Error ? err.message : String(err)}`);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [pokemonNumber]);

  if (loading) {
    return (
      <main className="page-shell">
        <div style={{ display: "grid", placeItems: "center", minHeight: "300px" }}>
          <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "1.2rem" }}>
            Carregando dados da PokeAPI...
          </div>
        </div>
      </main>
    );
  }

  if (error || !details) {
    return (
      <main className="page-shell">
        <div style={{ display: "grid", placeItems: "center", minHeight: "300px" }}>
          <div style={{ textAlign: "center", color: "var(--dex-red)", fontWeight: "bold", fontSize: "1.2rem" }}>
            {error || "Erro desconhecido"}
          </div>
          <Link href="/" className="btn-control" style={{ marginTop: "20px", textDecoration: "none" }}>
            Voltar para a Pokédex
          </Link>
        </div>
      </main>
    );
  }

  const mainType = details.types[0] ?? "normal";
  const statLabels: Record<keyof typeof details.stats, string> = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defesa",
    specialAttack: "Sp. Atk",
    specialDefense: "Sp. Def",
    speed: "Veloc.",
  };

  return (
    <main className="page-shell">
      <div style={{ marginBottom: "20px" }}>
        <Link href="/" className="btn-control" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          ← Voltar para a Pokédex
        </Link>
      </div>

      <div className="modal-container" style={{ width: "100%", margin: "0 auto", animation: "none", position: "static", maxHeight: "none" }}>
        <div className="modal-body">
          <div className="details-grid">
            <div className={`details-visuals type-${mainType}`}>
              <div className="details-visuals__image-container">
                <Image
                  src={details.imageUrl}
                  alt={details.name}
                  width={250}
                  height={250}
                  priority
                />
              </div>
            </div>

            <div className="details-info">
              <div className="details-info__header">
                <div className="details-info__title-row">
                  <h2 style={{ textTransform: "capitalize" }}>{details.name}</h2>
                  <span className="details-info__number">
                    #{details.number.toString().padStart(3, "0")}
                  </span>
                </div>
                <div className="details-info__types">
                  {details.types.map((type) => (
                    <span key={type} className={`type-badge-${type}`}>
                      {typeLabels[type] ?? type}
                    </span>
                  ))}
                </div>
              </div>

              <p className="details-info__lore">
                {details.lore || "Sem descrição disponível."}
              </p>

              <div>
                <h3 className="details-section-title">Status Base</h3>
                <div className="stats-list">
                  {(Object.keys(details.stats) as Array<keyof typeof details.stats>).map((key) => {
                    const value = details.stats[key];
                    const percent = Math.min(100, (value / 180) * 100);
                    return (
                      <div key={key} className="stat-row">
                        <span className="stat-label">{statLabels[key]}</span>
                        <span className="stat-val">{value}</span>
                        <div className="stat-bar">
                          <div
                            className="stat-bar-fill"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: `var(--type-${mainType}, var(--dex-blue))`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {details.weaknesses.length > 0 && (
                <div>
                  <h3 className="details-section-title">Fraquezas (Dano x2)</h3>
                  <div className="weaknesses-list">
                    {details.weaknesses.map((type) => (
                      <span key={type} className={`weakness-badge ${type}`}>
                        {typeLabels[type] ?? type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {details.evolutions && details.evolutions.length > 1 && (
                <div>
                  <h3 className="details-section-title">Evoluções</h3>
                  <div className="evolution-chain-list">
                    {details.evolutions.map((evo, index) => (
                      <div key={evo.number} className="evolution-chain-step">
                        {index > 0 && <span className="evolution-arrow">➔</span>}
                        <button
                          className="evolution-card"
                          onClick={() => router.push(`/pokemon/${evo.number}`)}
                        >
                          <Image
                            src={evo.imageUrl}
                            alt={evo.name}
                            width={50}
                            height={50}
                          />
                          <span>{evo.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
