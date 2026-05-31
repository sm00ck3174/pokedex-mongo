from typing import TypedDict


class PokemonStats(TypedDict):
    hp: int
    attack: int
    defense: int
    specialAttack: int
    specialDefense: int
    speed: int


class PokemonDocument(TypedDict):
    number: int
    name: str
    types: list[str]
    height: int
    weight: int
    abilities: list[str]
    imageUrl: str
    stats: PokemonStats
