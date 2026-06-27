from motor.motor_asyncio import AsyncIOMotorDatabase

from app.services.pokeapi import fetch_pokemon_batch


COLLECTION = "pokemon"


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    await db[COLLECTION].create_index("number", unique=True)
    await db[COLLECTION].create_index("name")
    await db[COLLECTION].create_index("types")

    # Backfill total_stats for older seeds
    cursor = db[COLLECTION].find({"total_stats": {"$exists": False}})
    async for doc in cursor:
        stats = doc.get("stats", {})
        total = sum(stats.values())
        await db[COLLECTION].update_one({"_id": doc["_id"]}, {"$set": {"total_stats": total}})


async def list_pokemon(
    db: AsyncIOMotorDatabase,
    search: str | None = None,
    type_: str | None = None,
    sort_by: str | None = "number",
    order: str | None = "asc",
    limit: int = 151,
    offset: int = 0,
) -> tuple[int, list[dict]]:
    filters: dict = {}

    if search:
        filters["name"] = {"$regex": search, "$options": "i"}

    if type_:
        filters["types"] = type_.lower()

    # Determine sorting field
    sort_field = "number"
    if sort_by == "name":
        sort_field = "name"
    elif sort_by in ["hp", "attack", "defense", "specialAttack", "specialDefense", "speed"]:
        sort_field = f"stats.{sort_by}"
    elif sort_by == "total_stats":
        sort_field = "total_stats"
    elif sort_by == "weight":
        sort_field = "weight"
    elif sort_by == "height":
        sort_field = "height"

    sort_direction = 1 if order == "asc" else -1

    total = await db[COLLECTION].count_documents(filters)
    cursor = (
        db[COLLECTION]
        .find(filters, {"_id": 0})
        .sort(sort_field, sort_direction)
        .skip(offset)
        .limit(limit)
    )
    return total, await cursor.to_list(length=limit)


async def get_pokemon_by_number(db: AsyncIOMotorDatabase, number: int) -> dict | None:
    return await db[COLLECTION].find_one({"number": number}, {"_id": 0})


async def seed_pokemon(db: AsyncIOMotorDatabase, limit: int = 151) -> int:
    await ensure_indexes(db)
    pokemon = await fetch_pokemon_batch(limit)
    await db[COLLECTION].delete_many({})

    if pokemon:
        await db[COLLECTION].insert_many(pokemon)

    return len(pokemon)
