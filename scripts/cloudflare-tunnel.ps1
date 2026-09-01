# Cloudflare Tunnel — testar no celular (4G ou qualquer rede)
# Requer cloudflared: winget install Cloudflare.cloudflared

$ErrorActionPreference = "Stop"

function Find-Cloudflared {
    $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $local = Join-Path $PSScriptRoot "cloudflared.exe"
    if (Test-Path $local) { return $local }
    return $null
}

$cloudflared = Find-Cloudflared
if (-not $cloudflared) {
    Write-Host ""
    Write-Host "cloudflared nao encontrado." -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale com:" -ForegroundColor Yellow
    Write-Host "  winget install Cloudflare.cloudflared"
    Write-Host ""
    Write-Host "Ou baixe em:" -ForegroundColor Yellow
    Write-Host "  https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "=== ParkingApp — Cloudflare Tunnel ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Antes de continuar, suba backend e frontend:" -ForegroundColor Yellow
Write-Host "  backend:  uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
Write-Host "  web:      npm run dev"
Write-Host ""
Write-Host "Abrindo 2 tuneis (URLs aparecem em cada janela)..." -ForegroundColor Green
Write-Host ""

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& '$cloudflared' tunnel --url http://127.0.0.1:8000"
)

Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "& '$cloudflared' tunnel --url http://127.0.0.1:5173"
)

Write-Host "Proximo passo:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Copie a URL da API  (*.trycloudflare.com) do terminal da porta 8000"
Write-Host "2. Copie a URL do Web  (*.trycloudflare.com) do terminal da porta 5173"
Write-Host ""
Write-Host "3. Crie/edite web/.env:" -ForegroundColor Yellow
Write-Host "   VITE_API_URL=https://SUA-URL-API.trycloudflare.com"
Write-Host ""
Write-Host "4. Crie/edite backend/.env:" -ForegroundColor Yellow
Write-Host "   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://SUA-URL-WEB.trycloudflare.com"
Write-Host "   FRONTEND_URL=https://SUA-URL-WEB.trycloudflare.com"
Write-Host ""
Write-Host "5. Reinicie backend e frontend (Ctrl+C e suba de novo)"
Write-Host ""
Write-Host "6. No celular, abra a URL do Web no navegador" -ForegroundColor Green
Write-Host ""
