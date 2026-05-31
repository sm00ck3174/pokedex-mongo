import argparse
import asyncio
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.db.mongo import close_mongo_connection, connect_to_mongo, get_database
from app.services.pokemon_service import seed_pokemon


async def main(limit: int) -> None:
    await connect_to_mongo()
    try:
        inserted = await seed_pokemon(get_database(), limit=limit)
        print(f"Seed finalizado: {inserted} Pokemon salvos no MongoDB.")
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Popula o MongoDB com dados da PokeAPI.")
    parser.add_argument("--limit", type=int, default=151, help="Quantidade de Pokemon para buscar.")
    args = parser.parse_args()

    asyncio.run(main(args.limit))
