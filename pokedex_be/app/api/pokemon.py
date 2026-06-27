from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongo import get_database
from app.schemas.pokemon import PokemonListResponse, PokemonOut, PokemonDetailsOut
from app.services.pokemon_service import get_pokemon_by_number, list_pokemon
from app.services.pokeapi_details import get_pokemon_detailed_info

router = APIRouter(prefix="/pokemon", tags=["pokemon"])


@router.get("", response_model=PokemonListResponse)
async def find_all_pokemon(
    search: str | None = Query(default=None, min_length=1),
    type: str | None = Query(default=None, min_length=1),
    sort_by: str | None = Query(default="number"),
    order: str | None = Query(default="asc"),
    limit: int = Query(default=151, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> PokemonListResponse:
    total, items = await list_pokemon(
        db, search=search, type_=type, sort_by=sort_by, order=order, limit=limit, offset=offset
    )
    return PokemonListResponse(total=total, items=items)


@router.get("/{number}", response_model=PokemonOut)
async def find_pokemon(
    number: int,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    pokemon = await get_pokemon_by_number(db, number)
    if not pokemon:
        raise HTTPException(status_code=404, detail="Pokemon nao encontrado")

    return pokemon


@router.get("/{number}/details", response_model=PokemonDetailsOut)
async def find_pokemon_details(
    number: int,
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> dict:
    try:
        return await get_pokemon_detailed_info(db, number)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
