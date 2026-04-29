# Capacitor React Integration Guide

## Getting Started with Native Features

Your Luminar app can now use native device features! Here are practical examples.

---

## 1️⃣ Camera Integration

### Basic Example
```javascript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';

function PhotoCapture() {
  const [photo, setPhoto] = useState(null);

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        promptLabelPhoto: 'Select Photo',
        promptLabelPicture: 'Take Picture',
        promptLabelCancel: 'Cancel',
      });

      setPhoto(image.webPath);
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  return (
    <div>
      <button onClick={takePhoto}>📸 Take Photo</button>
      {photo && <img src={photo} alt="Captured" style={{ maxWidth: '100%' }} />}
    </div>
  );
}

export default PhotoCapture;
```

### With Gallery
```javascript
const selectFromGallery = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,  // This opens gallery
  });

  setPhoto(image.webPath);
};
```

---

## 2️⃣ Geolocation

### Get Current Location
```javascript
import { Geolocation } from '@capacitor/geolocation';

async function UserLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  const getLocation = async () => {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      setLocation({
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        accuracy: coordinates.coords.accuracy,
      });
    } catch (err) {
      setError('Could not get location');
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={getLocation}>📍 Get My Location</button>
      {location && (
        <div>
          <p>Latitude: {location.latitude.toFixed(4)}</p>
          <p>Longitude: {location.longitude.toFixed(4)}</p>
          <p>Accuracy: {location.accuracy.toFixed(0)}m</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default UserLocation;
```

### Watch Location (Continuous Updates)
```javascript
useEffect(() => {
  let watchId;

  const watchPosition = async () => {
    watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      },
      (position) => {
        console.log('New position:', position);
        setLocation(position.coords);
      },
      (error) => {
        console.error('Watch error:', error);
      }
    );
  };

  watchPosition();

  return () => {
    if (watchId) {
      Geolocation.clearWatch({ id: watchId });
    }
  };
}, []);
```

---

## 3️⃣ Network Status

### Check Connection
```javascript
import { Network } from '@capacitor/network';
import { useState, useEffect } from 'react';

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [networkType, setNetworkType] = useState('unknown');

  useEffect(() => {
    const checkNetwork = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
      setNetworkType(status.connectionType || 'none');
    };

    checkNetwork();

    // Listen for changes
    const listener = Network.addListener('networkStatusChange', (status) => {
      setIsOnline(status.connected);
      setNetworkType(status.connectionType);
    });

    return () => {
      listener.remove();
    };
  }, []);

  return (
    <div>
      <p>
        Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
      </p>
      <p>Connection: {networkType}</p>
    </div>
  );
}

export default NetworkStatus;
```

---

## 4️⃣ Status Bar Styling

### Customize App Appearance
```javascript
import { StatusBar, Style } from '@capacitor/status-bar';
import { useEffect } from 'react';

function AppSetup() {
  useEffect(() => {
    // Set status bar appearance
    StatusBar.setStyle({ style: Style.Dark });  // or Style.Light
    StatusBar.setBackgroundColor({ color: '#1a1a1a' });
    StatusBar.setOverlaysWebView({ overlay: true });
  }, []);

  return null;
}

export default AppSetup;
```

---

## 5️⃣ Splash Screen

### Show/Hide Splash on Startup
```javascript
import { SplashScreen } from '@capacitor/splash-screen';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Hide splash screen after app loads
    const hideSplash = async () => {
      await SplashScreen.hide();
    };

    // Give app time to load
    setTimeout(() => {
      hideSplash();
    }, 3000);
  }, []);

  return <div>Your App Content</div>;
}

export default App;
```

---

## 6️⃣ Platform Detection

### Detect Which Platform User Is On
```javascript
import { Capacitor } from '@capacitor/core';

function PlatformSpecificUI() {
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();

  return (
    <div>
      <p>Platform: {platform}</p>
      <p>Is Native: {isNative ? 'Yes' : 'No (Web)'}</p>

      {platform === 'ios' && <p>🍎 Running on iOS</p>}
      {platform === 'android' && <p>🤖 Running on Android</p>}
      {platform === 'web' && <p>🌐 Running on Web</p>}
    </div>
  );
}

export default PlatformSpecificUI;
```

### Conditional Component Loading
```javascript
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

// Only use camera component on native platforms
if (isNative) {
  import('./NativeCamera').then(({ NativeCamera }) => {
    // Use NativeCamera component
  });
}
```

---

## 7️⃣ Best Practices

### ✅ DO:
- Check platform before using native features
- Handle permissions gracefully
- Provide fallbacks for web
- Test on actual devices, not just simulators

### ❌ DON'T:
- Assume native features work on web
- Forget to handle errors
- Use native features in development without testing on device
- Forget to request permissions in AndroidManifest.xml / Info.plist

---

## 8️⃣ Permissions

### iOS Permissions (Info.plist)
Already configured in your iOS project for:
- Camera
- Location
- Photo Library

Edit `ios/App/App/Info.plist` to add more:
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to take photos</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos</string>
```

### Android Permissions (AndroidManifest.xml)
Already configured for:
- Camera
- Location
- Internet

Edit `android/app/src/main/AndroidManifest.xml` to add more:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

---

## 9️⃣ Real-World Example: Photo Gallery with Location

```javascript
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { useState } from 'react';

function PhotoGalleryWithLocation() {
  const [photos, setPhotos] = useState([]);

  const capturePhotoWithLocation = async () => {
    try {
      // Get location
      const coordinates = await Geolocation.getCurrentPosition();

      // Take photo
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
      });

      // Store both
      const photo = {
        uri: image.webPath,
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      setPhotos([...photos, photo]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <button onClick={capturePhotoWithLocation}>
        📸 Capture with Location
      </button>

      <div style={{ marginTop: '20px' }}>
        {photos.map((photo, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <img src={photo.uri} alt={`Photo ${index}`} style={{ maxWidth: '100%' }} />
            <p>📍 Lat: {photo.latitude.toFixed(4)}, Lng: {photo.longitude.toFixed(4)}</p>
            <p>📅 {new Date(photo.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhotoGalleryWithLocation;
```

---

## 🔟 Adding More Plugins

Your app already has common plugins. To add more:

1. **Install plugin:**
   ```bash
   npm install @capacitor/plugin-name --save
   ```

2. **Update native projects:**
   ```bash
   npm run cap:sync
   ```

3. **Use in React:**
   ```javascript
   import { PluginName } from '@capacitor/plugin-name';
   ```

**Popular plugins:**
- `@capacitor/device` - Device info (model, platform, etc)
- `@capacitor/filesystem` - File access
- `@capacitor/storage` - Local storage
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/haptics` - Vibration/haptic feedback

---

## 📚 More Resources

- [Capacitor Plugin API](https://capacitorjs.com/plugins)
- [Camera Plugin Docs](https://capacitorjs.com/docs/apis/camera)
- [Geolocation Docs](https://capacitorjs.com/docs/apis/geolocation)
- [React Integration Guide](https://capacitorjs.com/docs/frameworks/react)

---

Happy coding! 🚀
