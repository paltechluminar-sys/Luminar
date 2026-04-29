@echo off
REM Quick setup script for Android development
REM This script sets up environment variables and guides Android Studio installation

echo.
echo ======================================
echo  Android Studio Setup for Luminar
echo ======================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: This script must run as Administrator!
    echo Please right-click and select "Run as Administrator"
    pause
    exit /b 1
)

echo Setting ANDROID_HOME environment variable...
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"

echo.
echo ✓ Environment variable set!
echo.
echo Next steps:
echo.
echo 1. Download Android Studio from:
echo    https://developer.android.com/studio
echo.
echo 2. Run the installer and complete the setup
echo.
echo 3. Open Android Studio and create a virtual device:
echo    - Tools menu → Device Manager
echo    - Click "Create Device"
echo    - Select Pixel 7 (or any model)
echo    - Select API 33 or higher
echo    - Click Finish
echo.
echo 4. Then run this command in PowerShell:
echo    npm run cap:run:android
echo.
pause
