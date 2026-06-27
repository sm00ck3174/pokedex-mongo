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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type EvolutionStep = {
  number: number;
  name: string;
  imageUrl: string;
  types: string[];
};

export type PokemonDetails = Pokemon & {
  lore: string;
  evolutions: EvolutionStep[];
  weaknesses: string[];
  shinyImageUrl: string;
  cryUrl: string;
};

export async function getPokemon(): Promise<PokemonListResponse> {
  const response = await fetch(`${API_URL}/pokemon?limit=151`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a Pokedex.");
  }

  return response.json();
}

export async function getPokemonDetails(number: number): Promise<PokemonDetails> {
  const response = await fetch(`${API_URL}/pokemon/${number}/details`);

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os detalhes do Pokemon.");
  }

  return response.json();
}
