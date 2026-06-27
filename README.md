# Pokedex Mongo

Script de inicialização para Windows e Linux.

## Como usar

### Windows (PowerShell)
Abra o PowerShell na raiz do repositório e execute:
```powershell
.\start-project.ps1
```

### Linux / macOS (Bash)
Abra o terminal na raiz do repositório e execute:
```bash
./start-project.sh
```


O script irá:

- iniciar o MongoDB com `docker compose up -d mongo`
- criar o virtualenv do backend
- instalar dependências do backend
- copiar `.env.example` para `.env` se necessário
- rodar o seed de Pokemon no MongoDB
- instalar dependências do frontend
- copiar `.env.example` para `.env.local` se necessário
- abrir o backend e o frontend em novas janelas do PowerShell

## URLs

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:3000`
