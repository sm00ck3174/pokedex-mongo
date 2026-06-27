from pydantic import BaseModel, ConfigDict, Field


class PokemonStats(BaseModel):
    """
    Pydantic schema representing Pokemon base stats.
    Allows mapping camelCase fields from/to snake_case.
    """
    hp: int = 0
    attack: int = 0
    defense: int = 0
    special_attack: int = Field(0, alias="specialAttack")
    special_defense: int = Field(0, alias="specialDefense")
    speed: int = 0

    model_config = ConfigDict(populate_by_name=True)


class PokemonOut(BaseModel):
    """
    Pydantic schema representing brief Pokemon data returned in lists.
    """
    number: int
    name: str
    types: list[str]
    height: int
    weight: int
    abilities: list[str]
    image_url: str = Field(alias="imageUrl")
    stats: PokemonStats

    model_config = ConfigDict(populate_by_name=True)


class EvolutionStep(BaseModel):
    """
    Pydantic schema representing a single step in a Pokemon evolution chain.
    """
    number: int
    name: str
    image_url: str = Field(alias="imageUrl")
    types: list[str]

    model_config = ConfigDict(populate_by_name=True)


class LocationDetail(BaseModel):
    """
    Pydantic schema representing the encounter location details for a Pokemon.
    """
    name: str
    details: list[str]


class PokemonDetailsOut(PokemonOut):
    """
    Pydantic schema representing the detailed Pokemon view including species lore,
    evolutions, shiny artwork, cry ogg files, and capture locations.
    """
    lore: str
    evolutions: list[EvolutionStep]
    shiny_image_url: str = Field(alias="shinyImageUrl")
    cry_url: str = Field(alias="cryUrl")
    locations: list[LocationDetail] = []

    model_config = ConfigDict(populate_by_name=True)


class PokemonListResponse(BaseModel):
    """
    Pydantic schema for paginated list response of Pokemon.
    """
    total: int
    items: list[PokemonOut]


class SeedResponse(BaseModel):
    """
    Pydantic schema representing the admin seed endpoint response.
    """
    inserted: int
    message: str
