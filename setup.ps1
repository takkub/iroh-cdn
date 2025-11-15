# One-command setup script for Iroh CDN (Windows PowerShell)
# Usage: .\setup.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iroh CDN - One Command Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚙️  Creating .env file..." -ForegroundColor Yellow
    @"
# Database
POSTGRES_USER=iroh
POSTGRES_PASSWORD=iroh
POSTGRES_DB=irohcdn
POSTGRES_PORT=5432

# API
API_PORT=6666
DATABASE_URL=postgresql://iroh:iroh@db:5432/irohcdn

# Web
WEB_PORT=5555
NEXT_PUBLIC_API_URL=http://localhost:6666
"@ | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ Created .env file" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Stop any running containers
Write-Host ""
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down -v 2>$null

# Build and start
Write-Host ""
Write-Host "🔨 Building and starting services..." -ForegroundColor Cyan
Write-Host "⏱️  This may take 10-30 minutes on first run..." -ForegroundColor Yellow
Write-Host ""

docker-compose up --build -d

# Wait for services to be healthy
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow

$maxWait = 120
$waitCount = 0
$ready = $false

while ($waitCount -lt $maxWait) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:6666/assets" -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host ""
            Write-Host "✅ All services are ready!" -ForegroundColor Green
            $ready = $true
            break
        }
    } catch {
        # Still waiting
    }

    $waitCount++
    Write-Host -NoNewline "."
    Start-Sleep -Seconds 2
}

Write-Host ""

if (-not $ready) {
    Write-Host "⚠️  Services took longer than expected to start" -ForegroundColor Yellow
    Write-Host "Check logs with: docker-compose logs" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "🎉 Iroh CDN is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Access:" -ForegroundColor Cyan
    Write-Host "   Web UI:  http://localhost:5555" -ForegroundColor White
    Write-Host "   API:     http://localhost:6666" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Useful commands:" -ForegroundColor Cyan
    Write-Host "   View logs:    docker-compose logs -f" -ForegroundColor White
    Write-Host "   Stop:         docker-compose down" -ForegroundColor White
    Write-Host "   Restart:      docker-compose restart" -ForegroundColor White
    Write-Host ""
}

