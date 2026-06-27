from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import get_settings

# Global MongoDB client instance
client: AsyncIOMotorClient | None = None


async def connect_to_mongo() -> None:
    """
    Initializes the global MongoDB client utilizing configured settings.
    """
    global client
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongo_uri)


async def close_mongo_connection() -> None:
    """
    Closes the global MongoDB client connection during teardown.
    """
    if client:
        client.close()


def get_database() -> AsyncIOMotorDatabase:
    """
    Returns the motor database instance for the application.
    Raises RuntimeError if the MongoDB client has not been connected.
    """
    if client is None:
        raise RuntimeError("MongoDB client is not connected")

    settings = get_settings()
    return client[settings.mongo_db]
