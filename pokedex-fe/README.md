# Pokedex FE

React frontend with Next.js to consume the FastAPI API.

## Run

```bash
cd pokedex-fe
npm install
# Windows
copy .env.example .env.local
# Linux/macOS
cp .env.example .env.local
npm run dev
```

Before launching the frontend, make sure to run MongoDB, start the API, and seed the database:

```bash
docker compose up -d mongo
cd pokedex_be
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# Windows CMD
.venv\Scripts\activate
pip install -r requirements.txt
# Windows
copy .env.example .env
# Linux/macOS
cp .env.example .env
python scripts/seed_pokemon.py --limit 151
uvicorn app.main:app --reload
```
