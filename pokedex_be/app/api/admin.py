from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import Settings, get_settings
from app.db.mongo import get_database
from app.schemas.pokemon import SeedResponse
from app.services.pokemon_service import seed_pokemon

# Initialize APIRouter for administrator operations
router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/seed-pokemon", response_model=SeedResponse)
async def seed_pokemon_endpoint(
    limit: int = Query(default=151, ge=1, le=500),
    settings: Settings = Depends(get_settings),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> SeedResponse:
    """
    Endpoint to seed the database with Pokemon data.
    Only accessible if ALLOW_SEED_ENDPOINT environment variable is enabled.
    """
    if not settings.allow_seed_endpoint:
        raise HTTPException(
            status_code=403,
            detail="Seed endpoint is disabled. Use the scripts/seed_pokemon.py script.",
        )

    inserted = await seed_pokemon(db, limit=limit)
    return SeedResponse(inserted=inserted, message="Seed completed successfully")
