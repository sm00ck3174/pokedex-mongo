import httpx
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.pokemon_service import COLLECTION

TYPE_EFFECTIVENESS = {
    "normal": {"rock": 0.5, "ghost": 0, "steel": 0.5},
    "fire": {"fire": 0.5, "water": 0.5, "grass": 2, "ice": 2, "bug": 2, "rock": 0.5, "dragon": 0.5, "steel": 2},
    "water": {"fire": 2, "water": 0.5, "grass": 0.5, "ground": 2, "rock": 2, "dragon": 0.5},
    "electric": {"water": 2, "electric": 0.5, "grass": 0.5, "ground": 0, "flying": 2, "dragon": 0.5},
    "grass": {"fire": 0.5, "water": 2, "grass": 0.5, "poison": 0.5, "ground": 2, "flying": 0.5, "bug": 0.5, "rock": 2, "dragon": 0.5, "steel": 0.5},
    "ice": {"fire": 0.5, "water": 0.5, "grass": 2, "ice": 0.5, "ground": 2, "flying": 2, "dragon": 2, "steel": 0.5},
    "fighting": {"normal": 2, "ice": 2, "poison": 0.5, "flying": 0.5, "psychic": 0.5, "bug": 0.5, "rock": 2, "ghost": 0, "dark": 2, "steel": 2, "fairy": 0.5},
    "poison": {"grass": 2, "poison": 0.5, "ground": 0.5, "rock": 0.5, "ghost": 0.5, "steel": 0, "fairy": 2},
    "ground": {"fire": 2, "electric": 2, "grass": 0.5, "poison": 2, "flying": 0, "bug": 0.5, "rock": 2, "steel": 2},
    "flying": {"electric": 0.5, "grass": 2, "fighting": 2, "bug": 2, "rock": 0.5, "steel": 0.5},
    "psychic": {"fighting": 2, "poison": 2, "psychic": 0.5, "dark": 0, "steel": 0.5},
    "bug": {"fire": 0.5, "grass": 2, "fighting": 0.5, "poison": 0.5, "flying": 0.5, "psychic": 2, "ghost": 0.5, "dark": 2, "steel": 0.5, "fairy": 0.5},
    "rock": {"fire": 2, "ice": 2, "fighting": 0.5, "ground": 0.5, "flying": 2, "bug": 2, "steel": 0.5},
    "ghost": {"normal": 0, "psychic": 2, "ghost": 2, "dark": 0.5},
    "dragon": {"dragon": 2, "steel": 0.5, "fairy": 0},
    "dark": {"fighting": 0.5, "psychic": 2, "ghost": 2, "dark": 0.5, "fairy": 0.5},
    "steel": {"fire": 0.5, "water": 0.5, "electric": 0.5, "ice": 2, "rock": 2, "steel": 0.5, "fairy": 2},
    "fairy": {"fire": 0.5, "fighting": 2, "poison": 0.5, "dragon": 2, "dark": 2, "steel": 0.5}
}

def calculate_weaknesses(types: list[str]) -> list[str]:
    weaknesses = []
    for attacker in TYPE_EFFECTIVENESS.keys():
        multiplier = 1.0
        for defender in types:
            multiplier *= TYPE_EFFECTIVENESS[attacker].get(defender, 1.0)
        if multiplier > 1.0:
            weaknesses.append(attacker)
    return weaknesses

async def get_pokemon_detailed_info(db: AsyncIOMotorDatabase, number: int) -> dict:
    # 1. Look up standard pokemon info from DB
    pokemon = await db[COLLECTION].find_one({"number": number}, {"_id": 0})
    if not pokemon:
        raise ValueError("Pokemon not found in database")

    types = pokemon.get("types", [])
    weaknesses = calculate_weaknesses(types)

    # Fetch extra data from PokeAPI
    lore = "No lore available."
    evolutions = []
    shiny_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/{number}.png"
    cry_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/cries/{number}.ogg"

    async with httpx.AsyncClient(timeout=10) as client:
        # Fetch Species info (for lore and evolution chain url)
        try:
            species_res = await client.get(f"https://pokeapi.co/api/v2/pokemon-species/{number}")
            if species_res.status_code == 200:
                species_data = species_res.json()
                
                # Extract Portuguese flavor text, or fall back to English
                flavor_entries = species_data.get("flavor_text_entries", [])
                pt_entry = next((e for e in flavor_entries if e["language"]["name"] in ["pt", "pt-BR"]), None)
                en_entry = next((e for e in flavor_entries if e["language"]["name"] == "en"), None)
                
                entry = pt_entry or en_entry
                if entry:
                    lore = entry["flavor_text"].replace("\n", " ").replace("\f", " ").replace("\r", " ")

                # Fetch Evolution Chain
                evo_chain_url = species_data.get("evolution_chain", {}).get("url")
                if evo_chain_url:
                    evo_res = await client.get(evo_chain_url)
                    if evo_res.status_code == 200:
                        evo_data = evo_res.json()
                        # Traverse chain
                        chain_node = evo_data.get("chain", {})
                        
                        # Helper to resolve species name, number, image, types
                        async def resolve_species(node: dict):
                            sp_url = node.get("species", {}).get("url", "")
                            # Parse ID from url: https://pokeapi.co/api/v2/pokemon-species/{id}/
                            try:
                                sp_id = int(sp_url.strip("/").split("/")[-1])
                            except (ValueError, IndexError):
                                return
                            
                            # Look up in DB
                            db_pokemon = await db[COLLECTION].find_one({"number": sp_id}, {"_id": 0})
                            if db_pokemon:
                                evolutions.append({
                                    "number": db_pokemon["number"],
                                    "name": db_pokemon["name"],
                                    "imageUrl": db_pokemon["imageUrl"],
                                    "types": db_pokemon["types"]
                                })
                            else:
                                # Fallback construction
                                evolutions.append({
                                    "number": sp_id,
                                    "name": node.get("species", {}).get("name", ""),
                                    "imageUrl": f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{sp_id}.png",
                                    "types": []
                                })
                            
                            for next_node in node.get("evolves_to", []):
                                await resolve_species(next_node)

                        await resolve_species(chain_node)
        except Exception as e:
            # Silently log/ignore external API fetch errors
            print(f"Error fetching extra PokeAPI info for #{number}: {e}")

    # Fallback to current pokemon in evolution chain if empty
    if not evolutions:
        evolutions = [{
            "number": pokemon["number"],
            "name": pokemon["name"],
            "imageUrl": pokemon["imageUrl"],
            "types": pokemon["types"]
        }]

    return {
        **pokemon,
        "lore": lore,
        "evolutions": evolutions,
        "weaknesses": weaknesses,
        "shinyImageUrl": shiny_url,
        "cryUrl": cry_url
    }
