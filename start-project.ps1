<#
Simple startup script for the Pokedex project on Windows.
Run this from PowerShell in the repository root:

  .\start-project.ps1
#>

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host 'Starting MongoDB with docker compose...' -ForegroundColor Cyan
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error 'Docker não encontrado. Instale o Docker ou execute o MongoDB manualmente.'
    exit 1
}

docker compose up -d mongo

$backendPath = Join-Path $root 'pokedex_be'
$frontendPath = Join-Path $root 'pokedex-fe'
$venvPath = Join-Path $backendPath '.venv'
$pythonExe = Join-Path $venvPath 'Scripts\python.exe'

Write-Host 'Configuring backend...' -ForegroundColor Cyan
Set-Location $backendPath

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

$pythonCmd = Get-ValidPython
if (-not $pythonCmd) {
    Write-Error 'Python não encontrado. Instale Python 3 e marque "Add Python to PATH" ou instale o launcher py.'
    exit 1
}

if (-not (Test-Path $venvPath)) {
    if ($pythonCmd -eq 'py') {
        & $pythonCmd -3 -m venv $venvPath
    } else {
        & $pythonCmd -m venv $venvPath
    }
}

if (-not (Test-Path $pythonExe)) {
    Write-Error "Virtualenv não encontrado em $pythonExe. Verifique se o venv foi criado corretamente."
    exit 1
}

& $pythonExe -m pip install --upgrade pip
& $pythonExe -m pip install -r requirements.txt

if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
}

Write-Host 'Seeding MongoDB with Pokemon data...' -ForegroundColor Cyan
& $pythonExe '.\scripts\seed_pokemon.py' --limit 151

Write-Host 'Configuring frontend...' -ForegroundColor Cyan
Set-Location $frontendPath
npm install
if (-not (Test-Path '.env.local')) {
    Copy-Item '.env.example' '.env.local'
}

Write-Host 'Setup concluído.' -ForegroundColor Green
Write-Host ''
Write-Host 'Iniciando backend e frontend em novas janelas...' -ForegroundColor Cyan

$terminalExe = if (Get-Command pwsh -ErrorAction SilentlyContinue) {
    'pwsh'
} elseif (Get-Command powershell -ErrorAction SilentlyContinue) {
    'powershell'
} else {
    Write-Error 'Nem pwsh nem powershell foram encontrados. Execute backend e frontend manualmente.'
    exit 1
}

Start-Process $terminalExe -ArgumentList '-NoExit', '-Command', "Set-Location '$backendPath'; & '$pythonExe' -m uvicorn app.main:app --reload"
Start-Process $terminalExe -ArgumentList '-NoExit', '-Command', "Set-Location '$frontendPath'; npm run dev"

Write-Host ''
Write-Host 'Se as janelas não abrirem automaticamente, execute manualmente:' -ForegroundColor Yellow
Write-Host "  cd $backendPath; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload"
Write-Host "  cd $frontendPath; npm run dev"
