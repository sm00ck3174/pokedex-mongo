# Pokedex Mongo

Startup script for Windows and Linux.

## How to use

### Windows (PowerShell)
Open PowerShell in the root of the repository and run:
```powershell
.\start-project.ps1
```

### Linux / macOS (Bash)
Open the terminal in the root of the repository and run:
```bash
./start-project.sh
```


The script will:

- Start MongoDB with `docker compose up -d mongo`
- Create the backend virtual environment (virtualenv)
- Install backend dependencies
- Copy `.env.example` to `.env` if necessary
- Run the Pokemon seed in MongoDB
- Install frontend dependencies
- Copy `.env.example` to `.env.local` if necessary
- Start both the backend and frontend services

## URLs

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:3000`
