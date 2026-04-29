# Android Studio Setup Script for Capacitor
# Run this as Administrator

Write-Host "🤖 Android Studio Setup for Luminar App" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "⚠️  This script must run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Step 1: Set ANDROID_HOME environment variable
Write-Host "`n📍 Step 1: Setting ANDROID_HOME environment variable..." -ForegroundColor Yellow
$AndroidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $AndroidSdkPath, "User")

# Verify it's set
$androidHome = [Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")
if ($androidHome) {
    Write-Host "✅ ANDROID_HOME set to: $androidHome" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set ANDROID_HOME" -ForegroundColor Red
}

# Step 2: Check for Java
Write-Host "`n📍 Step 2: Checking for Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    Write-Host "✅ Java is installed:" -ForegroundColor Green
    Write-Host $javaVersion[0]
} catch {
    Write-Host "⚠️  Java not found. Android Studio will install JDK during setup." -ForegroundColor Yellow
}

# Step 3: Check if Android SDK exists
Write-Host "`n📍 Step 3: Checking for Android SDK..." -ForegroundColor Yellow
if (Test-Path $AndroidSdkPath) {
    Write-Host "✅ Android SDK found at: $AndroidSdkPath" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Android SDK not yet installed (will be done by Android Studio)" -ForegroundColor Cyan
}

# Step 4: Download Android Studio (optional)
Write-Host "`n📍 Step 4: Android Studio Download Options" -ForegroundColor Yellow
Write-Host "`nYou have two options:`n" -ForegroundColor White
Write-Host "1️⃣  Manual Download (Recommended)" -ForegroundColor Cyan
Write-Host "   Visit: https://developer.android.com/studio" -ForegroundColor White
Write-Host "   Click 'Download Android Studio'" -ForegroundColor White
Write-Host "`n2️⃣  Automatic Download (using PowerShell)" -ForegroundColor Cyan
Write-Host "   This script can download it for you..." -ForegroundColor White

$downloadChoice = Read-Host "`nDo you want me to download Android Studio? (Y/N)"

if ($downloadChoice -eq "Y" -or $downloadChoice -eq "y") {
    Write-Host "`n⬇️  Downloading Android Studio..." -ForegroundColor Yellow
    $downloadUrl = "https://redirector.gstatic.com/android/studio/install/2024.1.1.13/android-studio-2024.1.1.13-windows.exe"
    $downloadPath = "$env:TEMP\android-studio-installer.exe"
    
    try {
        Write-Host "Downloading from: $downloadUrl" -ForegroundColor Gray
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath -UseBasicParsing
        
        if (Test-Path $downloadPath) {
            Write-Host "✅ Download complete! File saved to: $downloadPath" -ForegroundColor Green
            Write-Host "`n🚀 IMPORTANT: Now run the installer manually!" -ForegroundColor Cyan
            $openInstaller = Read-Host "Open the installer now? (Y/N)"
            if ($openInstaller -eq "Y" -or $openInstaller -eq "y") {
                Start-Process $downloadPath
                Write-Host "⏳ Installer launched. Please complete the installation wizard." -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "⚠️  Download failed. Please download manually from:" -ForegroundColor Yellow
        Write-Host "https://developer.android.com/studio" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n📝 Please download Android Studio manually from:" -ForegroundColor Yellow
    Write-Host "https://developer.android.com/studio" -ForegroundColor Cyan
}

# Step 5: Verification
Write-Host "`n📍 Step 5: Next Steps" -ForegroundColor Yellow
Write-Host @"
After Android Studio is installed:

1. Open Android Studio
2. Go to: Tools → Device Manager → Create Device
3. Select "Pixel 7" or any model
4. Select API 33 or higher
5. Click Finish

Then in PowerShell, run:
  cd C:\Luminar
  npm run cap:run:android

Your app will automatically run in the emulator! 🎉
"@ -ForegroundColor Green

# Final check
Write-Host "`n✅ Setup script complete!" -ForegroundColor Green
Write-Host "⏳ Restart PowerShell after Android Studio is installed." -ForegroundColor Yellow
