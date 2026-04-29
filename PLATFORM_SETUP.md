# Platform Setup Requirements

## 🌐 Web Platform

✅ **Ready to use!**

Your app is already configured for web deployment.

```bash
npm start           # Development
npm run build       # Production build
```

Deploy the `build/` folder to any web host (Vercel, Netlify, Firebase, etc).

---

## 🍎 iOS Setup

### Requirements
- **Mac** with macOS 11+
- **Xcode** 14+ ([Download from App Store](https://apps.apple.com/us/app/xcode/id497799835))
- **CocoaPods** (usually comes with Xcode)
- **Xcode Command Line Tools**

### Installation Steps

1. **Install Xcode Command Line Tools:**
   ```bash
   xcode-select --install
   ```

2. **Verify Xcode is installed:**
   ```bash
   xcode-select -p
   # Should output: /Applications/Xcode.app/Contents/Developer
   ```

3. **Install CocoaPods** (if not already installed):
   ```bash
   sudo gem install cocoapods
   ```

4. **Build and open iOS project:**
   ```bash
   npm run cap:run:ios
   ```
   This will:
   - Build your React app
   - Sync assets to iOS
   - Open Xcode automatically

### Running on iOS

#### Simulator
```bash
npm run cap:run:ios
# Or manually in Xcode: Cmd+R
```

#### Physical Device
1. Connect iPhone to Mac via USB
2. In Xcode: Select your device from dropdown
3. Click Play button (Cmd+R)
4. May need to trust the app on phone: Settings > General > VPN & Device Management

### Building for App Store
1. Create Apple Developer account
2. In Xcode: Select Luminar app target
3. Go to Signing & Capabilities
4. Select your team
5. Product > Archive
6. Upload to App Store Connect

---

## 🤖 Android Setup

### Requirements
- **Android Studio** ([Download here](https://developer.android.com/studio))
- **Java Development Kit (JDK)** 11+ (Android Studio usually installs this)
- **Android SDK** API level 33+ (Android Studio installs this)
- Min 4GB RAM free
- Windows, Mac, or Linux

### Installation Steps

1. **Download & Install Android Studio** (Full installation)

2. **Open Android Studio and complete setup:**
   - Let it download Android SDK
   - Accept licenses
   - Wait for downloads to complete

3. **Verify Android installation:**
   ```bash
   flutter doctor  # or check Android Studio
   ```

4. **Set ANDROID_HOME environment variable** (required on Windows):
   
   **Windows:**
   ```powershell
   # Run this in PowerShell as Administrator
   $AndroidHome = "$env:LOCALAPPDATA\Android\Sdk"
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", $AndroidHome, "User")
   # Restart terminal/PowerShell after this
   ```

   **Mac/Linux:**
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/Sdk  # Mac
   export ANDROID_HOME=$HOME/Android/Sdk          # Linux
   ```

5. **Build and open Android project:**
   ```bash
   npm run cap:run:android
   ```
   This will:
   - Build your React app
   - Sync assets to Android
   - Open Android Studio automatically

### Running on Android

#### Emulator
```bash
npm run cap:run:android
# Or manually in Android Studio: Run > Run 'app'
```

First time setup:
1. Open Android Studio
2. Tools > Device Manager
3. Create Virtual Device
4. Select API 33+
5. Start the emulator
6. Then run `npm run cap:run:android`

#### Physical Device
1. Enable USB Debugging:
   - Settings > Developer Options > USB Debugging (turn on)
   - If no Developer Options, tap Build Number 7 times
2. Connect to computer via USB
3. In Android Studio: Select device from dropdown
4. Click Play button
5. Approve debugging on phone

### Building for Google Play Store
1. Create Google Play Developer account
2. In Android Studio: Build > Generate Signed Bundle/APK
3. Follow wizard (create keystore first time)
4. Upload APK to Google Play Console

---

## 🖥️ Desktop (Electron) - Optional

For desktop apps (Windows, Mac, Linux), consider:

```bash
npm install electron --save
npm install electron-builder --save-dev
```

Then adapt your Capacitor config to work with Electron. This is an optional enhancement.

---

## ✅ Quick Verification

Test your setup:

```bash
# Check all requirements
npm run cap:build

# Test web
npm start

# Test iOS (Mac only)
npm run cap:open:ios

# Test Android
npm run cap:open:android
```

---

## 📞 Troubleshooting

### iOS Issues

**"No provisioning profile"**
- In Xcode: Signing & Capabilities > Team > Xcode will auto-create profile

**"Simulator not opening"**
```bash
xcrun simctl erase all  # Clear all simulators
npm run cap:run:ios
```

### Android Issues

**"ANDROID_HOME not found"**
- Set environment variable (see steps above)
- Restart terminal after setting

**"Gradle sync failed"**
```bash
cd android
./gradlew clean build
cd ..
npm run cap:sync:android
```

**"Emulator won't start"**
- Check virtualization is enabled in BIOS
- Android Studio: Device Manager > Wipe Data > Start

### General

**Assets not updating?**
```bash
npm run build
npm run cap:sync
```

---

## 🎯 Recommended Development Setup

### Most Efficient Workflow:
1. **Start web development:** `npm start`
2. **Test in browser** until happy
3. **Sync to mobile:** `npm run cap:sync`
4. **Test on simulator/device**
5. **Repeat**

### Minimal Requirements by Goal:
- **Web only**: No additional setup needed ✅
- **iOS**: Mac + Xcode
- **Android**: Android Studio
- **All platforms**: All of the above

---

Enjoy building with Capacitor! 🚀
