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

  const getStatColor = (value: number) => {
    if (value < 50) return { color: "#ff4757", bg: "linear-gradient(90deg, #ff6b81, #ff4757)" }; // Red/Rose (Low)
    if (value < 85) return { color: "#ffa502", bg: "linear-gradient(90deg, #ffbe76, #ffa502)" }; // Yellow/Orange (Medium)
    if (value < 115) return { color: "#2ed573", bg: "linear-gradient(90deg, #7bed9f, #2ed573)" }; // Green/Emerald (High)
    return { color: "#1e90ff", bg: "linear-gradient(90deg, #70a1ff, #1e90ff)" }; // Blue/Cyan (Hyper)
  };

  return (
    <main style={{ width: "100%", maxWidth: "100%", minHeight: "100vh", padding: "24px", boxSizing: "border-box" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/" className="btn-control" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          ← Voltar para a Pokédex
        </Link>
      </div>
 
      <div className="details-container-fullscreen">
        <div className="modal-body">
          <div className="details-grid" style={{ display: "flex", gap: "36px", flexWrap: "wrap", alignItems: "flex-start" }}>
            <div className={`details-visuals type-${mainType}`} style={{ minHeight: "350px", justifyContent: "center", width: "100%", maxWidth: "340px", flex: "0 0 auto", borderRadius: "12px", position: "sticky", top: "24px", alignSelf: "flex-start", margin: "0 auto" }}>
              <div className="details-visuals__image-container" style={{ width: "100%", maxWidth: "280px" }}>
                <Image
                  src={details.imageUrl}
                  alt={details.name}
                  width={280}
                  height={280}
                  style={{ width: "100%", height: "auto", objectFit: "contain" }}
                  priority
                />
              </div>
            </div>
 
            <div className="details-info" style={{ flex: "1 1 400px" }}>
              <div className="details-info__header">
                <div className="details-info__title-row">
                  <h2 style={{ textTransform: "capitalize", fontSize: "2.2rem" }}>{details.name}</h2>
                  <span className="details-info__number" style={{ fontSize: "1.5rem" }}>
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
 
              <p className="details-info__lore" style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
                {details.lore || "Sem descrição disponível."}
              </p>
 
              <div>
                <h3 className="details-section-title">Status Base</h3>
                <div className="stats-list">
                  {(Object.keys(details.stats) as Array<keyof typeof details.stats>).map((key) => {
                    const value = details.stats[key];
                    const percent = Math.min(100, (value / 180) * 100);
                    const statStyle = getStatColor(value);
                    return (
                      <div key={key} className="stat-row">
                        <span className="stat-label">{statLabels[key]}</span>
                        <span className="stat-val" style={{ color: statStyle.color, fontWeight: "bold" }}>{value}</span>
                        <div className="stat-bar">
                          <div
                            className="stat-bar-fill"
                            style={{
                              width: `${percent}%`,
                              backgroundImage: statStyle.bg,
                              boxShadow: `0 0 6px ${statStyle.color}aa`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
 
              <div>
                <h3 className="details-section-title">Onde Encontrar</h3>
                {details.locations && details.locations.length > 0 ? (
                  <div className="locations-list" style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                    {details.locations.map((loc) => (
                      <div key={loc.name} className="location-card-item" style={{
                        background: "rgba(23, 32, 51, 0.05)",
                        border: "1px solid rgba(23, 32, 51, 0.12)",
                        borderRadius: "8px",
                        padding: "12px 16px",
                        color: "var(--ink)"
                      }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "var(--dex-dark-red)", fontSize: "0.95rem", fontWeight: "bold" }}>{loc.name}</h4>
                        <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.84rem", color: "var(--muted)", lineHeight: "1.5" }}>
                          {loc.details.map((detail, idx) => (
                            <li key={idx}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "4px 0 0" }}>
                    Este Pokémon não foi encontrado na natureza selvagem (pode ser obtido por evolução ou eventos especiais).
                  </p>
                )}
              </div>
 
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
