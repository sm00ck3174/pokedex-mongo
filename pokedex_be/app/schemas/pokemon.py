from pydantic import BaseModel, ConfigDict, Field


class PokemonStats(BaseModel):
    hp: int = 0
    attack: int = 0
    defense: int = 0
    special_attack: int = Field(0, alias="specialAttack")
    special_defense: int = Field(0, alias="specialDefense")
    speed: int = 0

    model_config = ConfigDict(populate_by_name=True)


class PokemonOut(BaseModel):
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
    number: int
    name: str
    image_url: str = Field(alias="imageUrl")
    types: list[str]

    model_config = ConfigDict(populate_by_name=True)


class LocationDetail(BaseModel):
    name: str
    details: list[str]


class PokemonDetailsOut(PokemonOut):
    lore: str
    evolutions: list[EvolutionStep]
    shiny_image_url: str = Field(alias="shinyImageUrl")
    cry_url: str = Field(alias="cryUrl")
    locations: list[LocationDetail] = []

    model_config = ConfigDict(populate_by_name=True)


class PokemonListResponse(BaseModel):
    total: int
    items: list[PokemonOut]


class SeedResponse(BaseModel):
    inserted: int
    message: str
