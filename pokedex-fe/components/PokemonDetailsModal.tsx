"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

interface PokemonDetailsModalProps {
  number: number;
  onClose: () => void;
  onSelectPokemon: (number: number) => void;
}

export function PokemonDetailsModal({ number, onClose, onSelectPokemon }: PokemonDetailsModalProps) {
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShiny, setShowShiny] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setShowShiny(false);

    getPokemonDetails(number)
      .then((data) => {
        if (active) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError("Não foi possível carregar os detalhes deste Pokémon.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [number]);

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ minHeight: "200px", display: "grid", placeItems: "center" }}>
          <button className="modal-close" onClick={onClose}>&times;</button>
          <div style={{ textAlign: "center", fontWeight: "bold" }}>Carregando dados da PokeAPI...</div>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ minHeight: "200px", display: "grid", placeItems: "center" }}>
          <button className="modal-close" onClick={onClose}>&times;</button>
          <div style={{ textAlign: "center", color: "var(--dex-red)", fontWeight: "bold" }}>{error || "Erro desconhecido"}</div>
        </div>
      </div>
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

  const playCry = () => {
    if (details.cryUrl) {
      const audio = new Audio(details.cryUrl);
      audio.volume = 0.4;
      audio.play().catch((err) => console.log("Erro ao reproduzir o som:", err));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-body">
          <div className="details-grid">
            <div className={`details-visuals type-${mainType}`}>
              <div className="details-visuals__image-container">
                <Image
                  src={showShiny ? details.shinyImageUrl : details.imageUrl}
                  alt={details.name}
                  width={200}
                  height={200}
                  priority
                />
              </div>

              <div className="visuals-controls">
                <button
                  className={`btn-control ${!showShiny ? "active" : ""}`}
                  onClick={() => setShowShiny(false)}
                >
                  Normal
                </button>
                <button
                  className={`btn-control ${showShiny ? "active" : ""}`}
                  onClick={() => setShowShiny(true)}
                >
                  Shiny ✨
                </button>
                {details.cryUrl && (
                  <button className="btn-control" onClick={playCry}>
                    Ouvir 🔊
                  </button>
                )}
              </div>
            </div>

            <div className="details-info">
              <div className="details-info__header">
                <div className="details-info__title-row">
                  <h2>{details.name}</h2>
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
                          onClick={() => onSelectPokemon(evo.number)}
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
    </div>
  );
}
