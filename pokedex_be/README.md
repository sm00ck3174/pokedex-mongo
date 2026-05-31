# Pokedex BE

API REST em FastAPI com MongoDB. Os dados dos Pokemon sao populados a partir da PokeAPI e salvos localmente no Mongo.

## Rodar

```bash
cd pokedex_be
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Popular o banco

Com o MongoDB rodando:

```bash
python scripts/seed_pokemon.py --limit 151
```

## Endpoints

- `GET /health`
- `GET /pokemon`
- `GET /pokemon/{number}`
- `POST /admin/seed-pokemon?limit=151` somente se `ALLOW_SEED_ENDPOINT=true`
