import httpx
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.pokemon_service import COLLECTION

async def get_pokemon_detailed_info(db: AsyncIOMotorDatabase, number: int) -> dict:
    """
    Fetches detailed metadata for a specific Pokemon (by database number).
    Aggregates data from MongoDB, PokeAPI (species details and lore, evolution chains, locations),
    and caches the results back to MongoDB to optimize subsequent queries.
    """
    # 1. Look up pokemon info from DB
    pokemon = await db[COLLECTION].find_one({"number": number}, {"_id": 0})
    if not pokemon:
        raise ValueError("Pokemon not found in database")

    # If detailed information is already cached, return it directly
    if pokemon.get("has_details"):
        return pokemon

    # Prepare default fallback values for extra details
    lore = "No lore available."
    evolutions = []
    shiny_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/{number}.png"
    cry_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/cries/{number}.ogg"
    locations = []

    async with httpx.AsyncClient(timeout=10) as client:
        # Fetch Species info (for lore and evolution chain url)
        try:
            species_res = await client.get(f"https://pokeapi.co/api/v2/pokemon-species/{number}")
            if species_res.status_code == 200:
                species_data = species_res.json()
                
                # Extract English flavor text, falling back to any available language if not present
                flavor_entries = species_data.get("flavor_text_entries", [])
                en_entry = next((e for e in flavor_entries if e["language"]["name"] == "en"), None)
                
                entry = en_entry or (flavor_entries[0] if flavor_entries else None)
                if entry:
                    lore = entry["flavor_text"].replace("\n", " ").replace("\f", " ").replace("\r", " ")

                # Fetch Evolution Chain
                evo_chain_url = species_data.get("evolution_chain", {}).get("url")
                if evo_chain_url:
                    evo_res = await client.get(evo_chain_url)
                    if evo_res.status_code == 200:
                        evo_data = evo_res.json()
                        # Traverse evolution chain
                        chain_node = evo_data.get("chain", {})
                        
                        # Helper function to resolve species name, number, image, types
                        async def resolve_species(node: dict):
                            sp_url = node.get("species", {}).get("url", "")
                            try:
                                sp_id = int(sp_url.strip("/").split("/")[-1])
                            except (ValueError, IndexError):
                                return
                            
                            # Look up the species in the local DB
                            db_pokemon = await db[COLLECTION].find_one({"number": sp_id}, {"_id": 0})
                            if db_pokemon:
                                evolutions.append({
                                    "number": db_pokemon["number"],
                                    "name": db_pokemon["name"],
                                    "imageUrl": db_pokemon["imageUrl"],
                                    "types": db_pokemon["types"]
                                })
                            else:
                                # Fallback construct if not stored locally
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

        # Fetch locations/encounters
        try:
            encounters_res = await client.get(f"https://pokeapi.co/api/v2/pokemon/{number}/encounters")
            if encounters_res.status_code == 200:
                encounters_data = encounters_res.json()
                
                import re

                def format_loc_name(name: str) -> str:
                    # Clean up location name by replacing hyphens and formatting to Title Case
                    cleaned = name.replace("-", " ")
                    cleaned = re.sub(r"\bmt\b", "Mt.", cleaned, flags=re.IGNORECASE)
                    return cleaned.title()

                def format_method(method: str) -> str:
                    # Provide user-friendly English equivalents for common encounter methods
                    methods_en = {
                        "walk": "Tall Grass",
                        "old-rod": "Old Rod",
                        "good-rod": "Good Rod",
                        "super-rod": "Super Rod",
                        "surf": "Surf",
                        "gift": "Gift",
                        "only-one": "Special Encounter",
                        "pokeflute": "Poké Flute",
                        "headbutt": "Headbutt",
                    }
                    return methods_en.get(method.lower(), method.replace("-", " ").title())

                temp_locations = {}
                for item in encounters_data:
                    loc_name = item.get("location_area", {}).get("name", "")
                    if not loc_name:
                        continue
                    
                    cleaned = format_loc_name(loc_name)
                    details_list = []
                    
                    for vd in item.get("version_details", []):
                        ver_name = vd.get("version", {}).get("name", "").replace("-", " ").title()
                        for ed in vd.get("encounter_details", []):
                            method_raw = ed.get("method", {}).get("name", "")
                            method_en = format_method(method_raw)
                            chance = ed.get("chance", 0)
                            min_lvl = ed.get("min_level", 0)
                            max_lvl = ed.get("max_level", 0)
                            
                            lvl_str = f"Lvl. {min_lvl}" if min_lvl == max_lvl else f"Lvl. {min_lvl}-{max_lvl}"
                            details_list.append(f"{method_en} ({lvl_str}, {chance}% chance) in Pokémon {ver_name}")
                    
                    if details_list:
                        if cleaned not in temp_locations:
                            temp_locations[cleaned] = []
                        temp_locations[cleaned].extend(details_list)

                for k, v in temp_locations.items():
                    seen_details = set()
                    unique_details = [x for x in v if not (x in seen_details or seen_details.add(x))]
                    locations.append({
                        "name": k,
                        "details": unique_details
                    })
        except Exception as e:
            print(f"Error fetching encounters for #{number}: {e}")

    # Fallback to current pokemon in evolution chain if empty
    if not evolutions:
        evolutions = [{
            "number": pokemon["number"],
            "name": pokemon["name"],
            "imageUrl": pokemon["imageUrl"],
            "types": pokemon["types"]
        }]

    details_doc = {
        **pokemon,
        "lore": lore,
        "evolutions": evolutions,
        "shinyImageUrl": shiny_url,
        "cryUrl": cry_url,
        "locations": locations,
        "has_details": True
    }

    # Save to MongoDB cache
    await db[COLLECTION].update_one({"number": number}, {"$set": details_doc})

    return details_doc
