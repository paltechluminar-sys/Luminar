# Live Reload for Mobile Development

Your Luminar app now supports **live reload** for mobile! Make changes and see them instantly on your Android device.

## 🚀 Live Reload Workflow (Fastest!)

### Step 1: Start Dev Server
```bash
npm start
```
This starts React dev server on `http://localhost:3000` with hot reload.

### Step 2: In Another Terminal, Deploy to Mobile
```bash
npm run mobile:dev:run
```

This will:
- Deploy the app with dev config pointing to your dev server
- Launch the app on Android emulator
- **Auto-reload when you save changes!** ⚡

### Step 3: Make Changes
Edit files in `src/` like normal:
```javascript
// src/Studio.jsx - make a change
return <h1>Updated Luminar App!</h1>
```

**Save the file → Changes appear on mobile instantly!** 🎉

---

## 📊 Workflow Comparison

| Scenario | Command | Time | Best For |
|----------|---------|------|----------|
| **Live Reload Dev** | `npm start` + `npm run mobile:dev:run` | ~1-2 sec per change | Rapid iteration |
| **Quick Sync** | `npm run cap:sync:android` | ~15 sec per change | Testing specific features |
| **Production Build** | `npm run mobile:prod:run` | ~5+ min | Final testing before release |

---

## 🎯 Quick Reference

### Development (Live Reload)
```bash
# Terminal 1
npm start

# Terminal 2
npm run mobile:dev:run

# Edit code in src/ and changes appear instantly on mobile!
```

### Production (Built App)
```bash
npm run mobile:prod:run
```

### Just Sync Code Changes (No Rebuild)
```bash
npm run mobile:dev:sync
# or
npm run mobile:prod:sync
```

---

## ⚙️ Under the Hood

### Two Capacitor Configs:

**Development** (`capacitor.config.dev.ts`):
```typescript
server: {
  url: 'http://192.168.100.5:3000',  // Points to dev server
  androidScheme: 'http',
  cleartext: true,  // Allows HTTP (not HTTPS)
}
```

**Production** (`capacitor.config.prod.ts`):
```typescript
webDir: 'build',  // Uses built React app
server: {
  androidScheme: 'https'
}
```

---

## 🔧 Troubleshooting

### App doesn't update after I save?
1. Make sure `npm start` is still running in Terminal 1
2. Check the browser at `http://localhost:3000` - does it update?
3. Try refreshing the app manually (swipe down or restart)

### "Cannot connect to localhost"?
- The emulator can't reach your computer's localhost
- This is expected - we use the IP address (192.168.100.5) instead
- If IP changed: update `capacitor.config.dev.ts` with new IP

### Find Your New IP?
```powershell
ipconfig | Select-String "IPv4"
```

---

## 💡 Tips

1. **Keep Terminal 1 running**: `npm start` must stay open for live reload
2. **First deploy is slow**: ~5 minutes for first `mobile:dev:run`
3. **After that**: Changes appear in ~1-2 seconds!
4. **Switch between dev/prod**: Use different commands
5. **Network access**: Dev server is only accessible on your local network

---

## 📱 Next Steps

1. Start dev server: `npm start`
2. In new terminal: `npm run mobile:dev:run`
3. Make a change to any React file
4. Watch it update on mobile! 🎊

Enjoy coding! ⚡
