export type PokemonStats = {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
};

export type Pokemon = {
  number: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  imageUrl: string;
  stats: PokemonStats;
};

export type PokemonListResponse = {
  total: number;
  items: Pokemon[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getPokemon(): Promise<PokemonListResponse> {
  const response = await fetch(`${API_URL}/pokemon?limit=151`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a Pokedex.");
  }

  return response.json();
}
