@echo off
echo Starting Visitor Pass Management System...

start "Backend Server" cmd /k "cd backend && npm run dev"
start "Frontend Client" cmd /k "cd frontend && npm run dev"

echo Servers started in new windows.
