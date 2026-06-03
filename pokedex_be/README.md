# Pokedex BE

API REST em FastAPI com MongoDB. Os dados dos Pokemon sao populados a partir da PokeAPI e salvos localmente no Mongo.

## Rodar

```bash
cd pokedex_be
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# Windows CMD
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate
pip install -r requirements.txt
# Windows
copy .env.example .env
# Linux/macOS
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
