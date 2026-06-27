import asyncio

import httpx

from app.models.pokemon import PokemonDocument

POKEAPI_URL = "https://pokeapi.co/api/v2/pokemon"


def map_stats(stats: list[dict]) -> dict[str, int]:
    result = {
        "hp": 0,
        "attack": 0,
        "defense": 0,
        "specialAttack": 0,
        "specialDefense": 0,
        "speed": 0,
    }

    stat_names = {
        "hp": "hp",
        "attack": "attack",
        "defense": "defense",
        "special-attack": "specialAttack",
        "special-defense": "specialDefense",
        "speed": "speed",
    }

    for item in stats:
        key = stat_names.get(item["stat"]["name"])
        if key:
            result[key] = item["base_stat"]

    return result


def map_pokemon(data: dict) -> PokemonDocument:
    official_art = data["sprites"]["other"]["official-artwork"]["front_default"]
    fallback_sprite = data["sprites"]["front_default"]
    stats = map_stats(data["stats"])
    total_stats = sum(stats.values())

    return {
        "number": data["id"],
        "name": data["name"],
        "types": [item["type"]["name"] for item in data["types"]],
        "height": data["height"],
        "weight": data["weight"],
        "abilities": [item["ability"]["name"] for item in data["abilities"]],
        "imageUrl": official_art or fallback_sprite or "",
        "stats": stats,
        "total_stats": total_stats,
    }


async def fetch_pokemon_batch(limit: int = 151) -> list[PokemonDocument]:
    async with httpx.AsyncClient(timeout=20) as client:
        items: list[PokemonDocument] = []

        for number in range(1, limit + 1):
            response = await client.get(f"{POKEAPI_URL}/{number}")
            response.raise_for_status()
            items.append(map_pokemon(response.json()))
            await asyncio.sleep(0.05)

        return items
