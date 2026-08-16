@echo off
cd /d "C:\Users\Manas Anudeep\Desktop\SIH 26\skillswap"

git add -A

git restore --staged -- current-skills-page.txt 2>nul
git restore --staged -- old-skills-page.txt 2>nul
git restore --staged -- prisma/schema.backup.prisma 2>nul

git commit -m "Update SkillSwap"

git push origin main

echo.
echo ================================
echo          COMMIT DONE
echo ================================
echo.

timeout /t 2 /nobreak >nul
exit