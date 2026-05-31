from motor.motor_asyncio import AsyncIOMotorDatabase

from app.services.pokeapi import fetch_pokemon_batch


COLLECTION = "pokemon"


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    await db[COLLECTION].create_index("number", unique=True)
    await db[COLLECTION].create_index("name")
    await db[COLLECTION].create_index("types")


async def list_pokemon(
    db: AsyncIOMotorDatabase,
    search: str | None = None,
    type_: str | None = None,
    limit: int = 151,
    offset: int = 0,
) -> tuple[int, list[dict]]:
    filters: dict = {}

    if search:
        filters["name"] = {"$regex": search, "$options": "i"}

    if type_:
        filters["types"] = type_.lower()

    total = await db[COLLECTION].count_documents(filters)
    cursor = (
        db[COLLECTION]
        .find(filters, {"_id": 0})
        .sort("number", 1)
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
