@echo off
setlocal
cd /d "%~dp0\.."
docker compose up --build -d
echo Open http://localhost:8000
