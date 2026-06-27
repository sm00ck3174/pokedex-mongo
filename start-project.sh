#!/bin/bash
set -e

# Simple startup script for the Pokedex project on Linux/macOS.

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}Starting MongoDB with docker compose...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker not found. Please install Docker or run MongoDB manually.${NC}"
    exit 1
fi

docker compose up -d mongo

# Paths
root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
backendPath="$root/pokedex_be"
frontendPath="$root/pokedex-fe"
venvPath="$backendPath/.venv"
pythonExe="$venvPath/bin/python"

echo -e "${CYAN}Configuring backend...${NC}"
cd "$backendPath"

# Find Python
pythonCmd=""
for cmd in python3 python; do
    if command -v $cmd &> /dev/null; then
        pythonCmd=$cmd
        break
    fi
done

if [ -z "$pythonCmd" ]; then
    echo -e "${RED}Error: Python not found. Please install Python 3.${NC}"
    exit 1
fi

if [ ! -d "$venvPath" ]; then
    $pythonCmd -m venv "$venvPath"
fi

$pythonExe -m pip install --upgrade pip
$pythonExe -m pip install -r requirements.txt

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

echo -e "${CYAN}Seeding MongoDB with Pokemon data...${NC}"
$pythonExe scripts/seed_pokemon.py --limit 151

echo -e "${CYAN}Configuring frontend...${NC}"
cd "$frontendPath"

# Auto-detect and configure fnm/node if not globally available
if ! command -v npm &> /dev/null; then
    for fnm_dir in "$HOME/.local/share/fnm" "/home/gabe/.local/share/fnm" "$HOME/.fnm"; do
        if [ -d "$fnm_dir" ]; then
            export PATH="$fnm_dir:$PATH"
            eval "$(fnm env --shell bash)"
            break
        fi
    done
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed or available in PATH. Please install Node.js and NPM.${NC}"
    exit 1
fi

npm install

if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
fi

echo -e "${GREEN}Setup completed.${NC}"
echo ""
echo -e "${CYAN}Starting backend and frontend... (Press Ctrl+C to stop both)${NC}"

# Start backend and frontend concurrently in the background and tail logs
# Use trap to clean them up on exit
trap 'echo -e "\n${YELLOW}Stopping processes...${NC}"; kill $(jobs -p) 2>/dev/null' EXIT

cd "$backendPath"
$pythonExe -m uvicorn app.main:app --reload &

cd "$frontendPath"
npm run dev &

# Wait for background jobs to finish
wait
