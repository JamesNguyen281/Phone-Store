@echo off
echo ========================================
echo TEST BUILD TRUOC KHI DEPLOY
echo ========================================
echo.

echo [1/3] Cleaning old build...
if exist dist rmdir /s /q dist
echo Done!
echo.

echo [2/3] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo Vui long sua loi truoc khi deploy.
    echo ========================================
    pause
    exit /b 1
)
echo Done!
echo.

echo [3/3] Testing build...
echo Starting preview server...
echo Open browser at: http://localhost:4173
echo Press Ctrl+C to stop
call npm run preview

pause
