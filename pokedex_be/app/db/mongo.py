from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

client: AsyncIOMotorClient | None = None


async def connect_to_mongo() -> None:
    global client
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongo_uri)


async def close_mongo_connection() -> None:
    if client:
        client.close()


def get_database() -> AsyncIOMotorDatabase:
    if client is None:
        raise RuntimeError("MongoDB client is not connected")

    settings = get_settings()
    return client[settings.mongo_db]
