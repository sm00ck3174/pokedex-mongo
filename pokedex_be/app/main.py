from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.pokemon import router as pokemon_router
from app.core.config import get_settings
from app.db.mongo import close_mongo_connection, connect_to_mongo, get_database
from app.services.pokemon_service import ensure_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the lifecycle of the FastAPI application.
    Handles startup events (connecting to MongoDB and ensuring database indexes)
    and shutdown events (closing the MongoDB connection).
    """
    # Startup actions
    await connect_to_mongo()
    await ensure_indexes(get_database())
    yield
    # Shutdown actions
    await close_mongo_connection()


# Retrieve settings configuration
settings = get_settings()

# Initialize FastAPI application with lifespan context manager
app = FastAPI(title="Pokedex API", version="0.1.0", lifespan=lifespan)

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers for endpoints
app.include_router(pokemon_router)
app.include_router(admin_router)


@app.get("/health")
async def health() -> dict[str, str]:
    """
    Simple health check endpoint to verify that the API is running.
    """
    return {"status": "ok"}
