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

// Configure Backend API Host URL
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type EvolutionStep = {
  number: number;
  name: string;
  imageUrl: string;
  types: string[];
};

export type LocationDetail = {
  name: string;
  details: string[];
};

export type PokemonDetails = Pokemon & {
  lore: string;
  evolutions: EvolutionStep[];
  shinyImageUrl: string;
  cryUrl: string;
  locations: LocationDetail[];
};

/**
 * Fetches list of Pokemon from backend API with optional search, type filter, and sorting.
 */
export async function getPokemon(params?: {
  search?: string;
  type?: string;
  sortBy?: string;
  order?: string;
}): Promise<PokemonListResponse> {
  const query = new URLSearchParams();
  query.append("limit", "151");
  if (params?.search) query.append("search", params.search);
  if (params?.type && params.type !== "all") query.append("type", params.type);
  if (params?.sortBy) query.append("sort_by", params.sortBy);
  if (params?.order) query.append("order", params.order);

  const response = await fetch(`${API_URL}/pokemon?${query.toString()}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Could not load Pokedex.");
  }

  return response.json();
}

/**
 * Fetches detailed metadata for a specific Pokemon by its number.
 */
export async function getPokemonDetails(number: number): Promise<PokemonDetails> {
  const response = await fetch(`${API_URL}/pokemon/${number}/details`);

  if (!response.ok) {
    throw new Error("Could not load Pokémon details.");
  }

  return response.json();
}
