import type { CapacitorConfig } from '@capacitor/cli';

// Development config - points to React dev server for live reload
const config: CapacitorConfig = {
  appId: 'com.luminar.app',
  appName: 'Luminar',
  webDir: 'build',
  server: {
    // Use 10.0.2.2 - special Android emulator IP to reach host localhost
    url: 'http://10.0.2.2:3000/Luminar',
    androidScheme: 'http',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    },
  },
};

export default config;
