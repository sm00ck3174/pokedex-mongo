import httpx
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.pokemon_service import COLLECTION

async def get_pokemon_detailed_info(db: AsyncIOMotorDatabase, number: int) -> dict:
    # 1. Look up pokemon info from DB
    pokemon = await db[COLLECTION].find_one({"number": number}, {"_id": 0})
    if not pokemon:
        raise ValueError("Pokemon not found in database")

    # If details are already cached, return immediately
    if pokemon.get("has_details"):
        return pokemon

    # Fetch extra data from PokeAPI
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

        # Fetch locations/encounters
        try:
            encounters_res = await client.get(f"https://pokeapi.co/api/v2/pokemon/{number}/encounters")
            if encounters_res.status_code == 200:
                encounters_data = encounters_res.json()
                
                import re
                translations = {
                    "area": "Área",
                    "route": "Rota",
                    "forest": "Floresta",
                    "cave": "Caverna",
                    "power plant": "Usina de Energia",
                    "seafoam islands": "Ilhas Seafoam",
                    "mansion": "Mansão",
                    "safari zone": "Zona de Safári",
                    "victory road": "Estrada da Vitória",
                    "mt moon": "Monte Moon",
                    "tower": "Torre",
                    "hideout": "Esconderijo",
                    "rock tunnel": "Túnel de Rocha",
                    "digletts cave": "Caverna dos Diglett",
                    "cerulean cave": "Caverna de Cerulean",
                }
                
                def format_loc_name(name: str) -> str:
                    cleaned = name.replace("-", " ")
                    for eng, pt in translations.items():
                        if eng in cleaned.lower():
                            cleaned = re.sub(re.escape(eng), pt, cleaned, flags=re.IGNORECASE)
                    return cleaned.title()

                def translate_method(method: str) -> str:
                    methods_pt = {
                        "walk": "Grama Alta",
                        "old-rod": "Vara Velha",
                        "good-rod": "Vara Boa",
                        "super-rod": "Super Vara",
                        "surf": "Surfe",
                        "gift": "Presente",
                        "only-one": "Encontro Único",
                        "pokeflute": "Pokéflute",
                        "headbutt": "Cabeçada",
                    }
                    return methods_pt.get(method.lower(), method.replace("-", " ").title())

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
                            method_pt = translate_method(method_raw)
                            chance = ed.get("chance", 0)
                            min_lvl = ed.get("min_level", 0)
                            max_lvl = ed.get("max_level", 0)
                            
                            lvl_str = f"Nív. {min_lvl}" if min_lvl == max_lvl else f"Nív. {min_lvl}-{max_lvl}"
                            details_list.append(f"{method_pt} ({lvl_str}, {chance}% chance) em Pokémon {ver_name}")
                    
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
