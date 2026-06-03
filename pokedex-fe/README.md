# Pokedex FE

Frontend em React com Next.js para consumir a API FastAPI.

## Rodar

```bash
cd pokedex-fe
npm install
# Windows
copy .env.example .env.local
# Linux/macOS
cp .env.example .env.local
npm run dev
```

Antes de abrir o front, rode o Mongo, a API e o seed:

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
