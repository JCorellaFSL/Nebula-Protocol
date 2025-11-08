@echo off
REM Nebula Protocol - Start Script (Windows)

echo 🌌 Starting Nebula Protocol Services...
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  No .env file found. Copying from .env.example...
    copy .env.example .env
    echo 📝 Please edit .env with your configuration before proceeding.
    echo    Then run this script again.
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Pull latest images
echo 📥 Pulling latest images...
docker-compose pull

REM Start services
echo 🚀 Starting services...
docker-compose up -d

REM Wait for services
echo ⏳ Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Check health
echo.
echo 🔍 Checking service health...
docker-compose ps

REM Test API
echo.
echo 🧪 Testing API health endpoint...
curl -f http://localhost:3000/health

echo.
echo ✅ Nebula Protocol is running!
echo.
echo 📊 Service URLs:
echo    - API:        http://localhost:3000
echo    - PostgreSQL: localhost:5432
echo    - Redis:      localhost:6379
echo    - Prometheus: http://localhost:9090 (if monitoring profile active)
echo    - Grafana:    http://localhost:3001 (if monitoring profile active)
echo.
echo 📖 View logs:    docker-compose logs -f
echo 🛑 Stop:         docker-compose down
echo 🗑️  Clean:        docker-compose down -v
echo.
pause

