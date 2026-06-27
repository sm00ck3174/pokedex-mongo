from typing import TypedDict


class PokemonStats(TypedDict):
    """
    Type definition for Pokemon base statistics in the database.
    """
    hp: int
    attack: int
    defense: int
    specialAttack: int
    specialDefense: int
    speed: int


class PokemonDocument(TypedDict):
    """
    Type definition representing a Pokemon document stored in MongoDB.
    """
    number: int
    name: str
    types: list[str]
    height: int
    weight: int
    abilities: list[str]
    imageUrl: str
    stats: PokemonStats
