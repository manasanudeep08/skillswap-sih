@echo off
setlocal
title SkillSwap - Push Changes

cd /d "%~dp0"

echo.
echo =================================================
echo          SkillSwap - Push Changes
echo =================================================
echo.

:: =================================================
:: CHECK GIT
:: =================================================

where git >nul 2>&1

if %errorlevel% neq 0 (
    echo Git is not installed.
    pause
    exit /b 1
)

:: =================================================
:: CHECK BRANCH
:: =================================================

for /f "delims=" %%B in ('git branch --show-current') do set "BRANCH=%%B"

if not "%BRANCH%"=="main" (
    echo.
    echo WARNING: You are currently on branch:
    echo %BRANCH%
    echo.
    echo This script only pushes the main branch.
    echo.
    pause
    exit /b 1
)

:: =================================================
:: SHOW CHANGES
:: =================================================

echo Your current changes:
echo.

git status

echo.
echo =================================================
echo.

set /p "CONFIRM=Continue with these changes? (Y/N): "

if /I not "%CONFIRM%"=="Y" (
    echo.
    echo Push cancelled.
    pause
    exit /b 0
)

:: =================================================
:: ASK COMMIT MESSAGE
:: =================================================

echo.
set /p "MESSAGE=Enter a commit message: "

if "%MESSAGE%"=="" (
    echo.
    echo Commit message cannot be empty.
    pause
    exit /b 1
)

:: =================================================
:: ADD CHANGES
:: =================================================

echo.
echo Adding changes...
echo.

git add .

if %errorlevel% neq 0 (
    echo.
    echo Failed to add changes.
    pause
    exit /b 1
)

:: =================================================
:: COMMIT
:: =================================================

echo.
echo Creating commit...
echo.

git commit -m "%MESSAGE%"

if %errorlevel% neq 0 (
    echo.
    echo Commit failed.
    pause
    exit /b 1
)

:: =================================================
:: GET LATEST REMOTE CHANGES
:: =================================================

echo.
echo Checking GitHub for new changes...
echo.

git pull --rebase origin main

if %errorlevel% neq 0 (
    echo.
    echo =================================================
    echo GitHub has changes that could not be combined
    echo automatically.
    echo =================================================
    echo.
    echo Your commit is still saved locally.
    echo.
    echo Push cancelled so nothing gets overwritten.
    echo.
    pause
    exit /b 1
)

:: =================================================
:: PUSH
:: =================================================

echo.
echo Uploading changes to GitHub...
echo.

git push origin main

if %errorlevel% neq 0 (
    echo.
    echo =================================================
    echo Push failed.
    echo =================================================
    echo.
    echo Your commit is still saved locally.
    echo.
    pause
    exit /b 1
)

:: =================================================
:: DONE
:: =================================================

echo.
echo =================================================
echo              PUSH SUCCESSFUL!
echo =================================================
echo.
echo Your changes are now on GitHub.
echo.
echo Your teammates can get them by running:
echo SkillSwap.bat
echo.
pause