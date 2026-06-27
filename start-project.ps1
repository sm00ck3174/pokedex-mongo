<#
Simple startup script for the Pokedex project on Windows.
Run this from PowerShell in the repository root:

  .\start-project.ps1
#>

# Stop script execution immediately if any command fails
$ErrorActionPreference = 'Stop'

# Get the root directory of the project based on the script location
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# Check if Docker is available and start MongoDB service
Write-Host 'Starting MongoDB with docker compose...' -ForegroundColor Cyan
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error 'Docker not found. Please install Docker or run MongoDB manually.'
    exit 1
}

docker compose up -d mongo

# Define paths for backend and frontend components
$backendPath = Join-Path $root 'pokedex_be'
$frontendPath = Join-Path $root 'pokedex-fe'
$venvPath = Join-Path $backendPath '.venv'
$pythonExe = Join-Path $venvPath 'Scripts\python.exe'

# Configure the backend environment
Write-Host 'Configuring backend...' -ForegroundColor Cyan
Set-Location $backendPath

# Helper function to find a valid Python 3 command in PATH
function Get-ValidPython {
    $candidates = @('py', 'python3', 'python')
    foreach ($cmd in $candidates) {
        if (Get-Command $cmd -ErrorAction SilentlyContinue) {
            try {
                & $cmd --version > $null 2>&1
                return $cmd
            } catch {
                continue
            }
        }
    }
    return $null
}

# Locate Python 3
$pythonCmd = Get-ValidPython
if (-not $pythonCmd) {
    Write-Error 'Python not found. Please install Python 3 and select "Add Python to PATH" or install the py launcher.'
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path $venvPath)) {
    if ($pythonCmd -eq 'py') {
        & $pythonCmd -3 -m venv $venvPath
    } else {
        & $pythonCmd -m venv $venvPath
    }
}

# Double check that the virtualenv python executable is available
if (-not (Test-Path $pythonExe)) {
    Write-Error "Virtualenv not found at $pythonExe. Please verify if the venv was created successfully."
    exit 1
}

# Update pip and install python packages
& $pythonExe -m pip install --upgrade pip
& $pythonExe -m pip install -r requirements.txt

# Copy backend environment configuration example if .env is missing
if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
}

# Seed Pokemon data into MongoDB database
Write-Host 'Seeding MongoDB with Pokemon data...' -ForegroundColor Cyan
& $pythonExe '.\scripts\seed_pokemon.py' --limit 151

# Configure the frontend environment
Write-Host 'Configuring frontend...' -ForegroundColor Cyan
Set-Location $frontendPath

# Install Node modules and copy frontend configuration
npm install
if (-not (Test-Path '.env.local')) {
    Copy-Item '.env.example' '.env.local'
}

Write-Host 'Setup completed.' -ForegroundColor Green
Write-Host ''
Write-Host 'Starting backend and frontend in new windows...' -ForegroundColor Cyan

# Determine which shell terminal command to use to launch the separate processes
$terminalExe = if (Get-Command pwsh -ErrorAction SilentlyContinue) {
    'pwsh'
} elseif (Get-Command powershell -ErrorAction SilentlyContinue) {
    'powershell'
} else {
    Write-Error 'Neither pwsh nor powershell was found. Run the backend and frontend manually.'
    exit 1
}

# Launch backend and frontend development servers in separate windows
Start-Process $terminalExe -ArgumentList '-NoExit', '-Command', "Set-Location '$backendPath'; & '$pythonExe' -m uvicorn app.main:app --reload"
Start-Process $terminalExe -ArgumentList '-NoExit', '-Command', "Set-Location '$frontendPath'; npm run dev"

Write-Host ''
Write-Host 'If windows do not open automatically, run manually:' -ForegroundColor Yellow
Write-Host "  cd $backendPath; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload"
Write-Host "  cd $frontendPath; npm run dev"
