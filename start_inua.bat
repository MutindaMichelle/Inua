@echo off
title INUA Mentorship Platform Launcher
echo ===========================================================================
echo   INUA MENTORSHIP PLATFORM -- FULL-STACK LAUNCHER
echo ===========================================================================
echo.
echo [1/2] Starting FastAPI Backend Server on http://127.0.0.1:8000 ...
start "INUA FastAPI Backend" cmd /k "python backend/run.py"

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "INUA React Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo Both servers are launching in separate windows!
echo   - Frontend App : http://localhost:5173
echo   - Swagger Docs : http://127.0.0.1:8000/docs
echo ===========================================================================
