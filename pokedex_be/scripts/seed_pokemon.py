import argparse
import asyncio
from pathlib import Path
import sys

# Locate root directory and add to sys.path to permit app package imports
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.db.mongo import close_mongo_connection, connect_to_mongo, get_database
from app.services.pokemon_service import seed_pokemon


async def main(limit: int) -> None:
    """
    Main function to execute the seed routine under an active event loop.
    """
    await connect_to_mongo()
    try:
        inserted = await seed_pokemon(get_database(), limit=limit)
        print(f"Seed completed: {inserted} Pokemon saved to MongoDB.")
    finally:
        await close_mongo_connection()


if __name__ == "__main__":
    # Setup CLI command-line parser
    parser = argparse.ArgumentParser(description="Populates MongoDB with PokeAPI data.")
    parser.add_argument("--limit", type=int, default=151, help="Quantity of Pokemon to fetch.")
    args = parser.parse_args()

    # Execute async seed process
    asyncio.run(main(args.limit))
