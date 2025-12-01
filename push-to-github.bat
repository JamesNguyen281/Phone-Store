@echo off
echo ========================================
echo PUSH CODE LEN GITHUB
echo ========================================
echo.

REM Kiem tra xem da init git chua
if not exist .git (
    echo [1/5] Initializing Git...
    git init
    git branch -M main
    echo Done!
    echo.
) else (
    echo [1/5] Git already initialized
    echo.
)

echo [2/5] Adding files...
git add .
echo Done!
echo.

echo [3/5] Committing...
set /p commit_msg="Nhap commit message (Enter de dung mac dinh): "
if "%commit_msg%"=="" set commit_msg=Update code

git commit -m "%commit_msg%"
echo Done!
echo.

echo [4/5] Checking remote...
git remote -v | findstr origin >nul
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo CHUA CO REMOTE REPOSITORY!
    echo ========================================
    echo.
    echo Vui long tao repo tren GitHub truoc:
    echo 1. Vao https://github.com/new
    echo 2. Tao repo moi
    echo 3. Copy URL cua repo
    echo.
    set /p repo_url="Nhap URL repo (vd: https://github.com/username/repo.git): "
    
    if "%repo_url%"=="" (
        echo Khong co URL! Thoat.
        pause
        exit /b 1
    )
    
    git remote add origin %repo_url%
    echo Remote added!
    echo.
)

echo [5/5] Pushing to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo PUSH FAILED!
    echo ========================================
    echo.
    echo Co the ban can:
    echo 1. Login GitHub: git config --global user.name "Your Name"
    echo 2. Set email: git config --global user.email "your@email.com"
    echo 3. Hoac dung: git push -f origin main (neu can force push)
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo PUSH THANH CONG!
echo ========================================
echo.
echo Buoc tiep theo:
echo 1. Vao https://vercel.com/dashboard
echo 2. Click "Add New..." -^> "Project"
echo 3. Import repo vua push
echo 4. Them Environment Variables
echo 5. Deploy!
echo.
pause
