from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or default values.
    """
    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db: str = "pokedex"
    allow_seed_endpoint: bool = False
    frontend_origin: str = "http://localhost:3000"

    # Configure Pydantic settings to load from .env file
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached instance of Settings to avoid re-reading configuration from disk/env multiple times.
    """
    return Settings()
