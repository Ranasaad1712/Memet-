# Memet Live 🎥✨

A luxury-themed live-streaming & chat mobile app built with React Native + Expo.

## File Structure

```
memet-live/
├── App.js                          # Root shell: Login → Permission Gate → Tabs
├── package.json
├── src/
│   ├── theme/
│   │   └── colors.js               # Global color palette
│   ├── context/
│   │   └── AuthContext.js          # Global auth state (login/logout)
│   ├── navigation/
│   │   └── MainTabs.js             # Bottom tab navigator (4 tabs)
│   └── screens/
│       ├── LoginScreen.js          # Email/password, phone+OTP, Google
│       ├── PermissionGateScreen.js # Camera + mic permission request
│       ├── HomeScreen.js           # Stream grid + live studio
│       ├── ChatScreen.js           # Inbox + private chat rooms
│       ├── GamesScreen.js          # Mini-games dashboard
│       └── ProfileScreen.js        # Profile, stats, logout
```

## Setup in GitHub Codespaces

1. Copy all files above into your project, preserving the folder paths exactly
   (e.g. `src/screens/HomeScreen.js`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Expo dev server:
   ```bash
   npx expo start --tunnel
   ```
   Use `--tunnel` in Codespaces since the container's network isn't directly
   reachable by your phone — it lets Expo Go connect over the internet.
4. Scan the QR code with **Expo Go** (iOS/Android) to run the app on your phone.

## Notes

- All streams, users, and messages are **dummy/mock data** held in local
  component state — there's no backend yet. Wire up Firebase, Supabase, or
  your own API where you see the `DUMMY_STREAMS` / `CONVERSATIONS` arrays.
- Camera/mic permissions are requested once, right after login, via
  `expo-camera`'s `useCameraPermissions` and `expo-av`'s `Audio.requestPermissionsAsync`.
- The "Go Live" flow renders a real front-facing camera preview — it does not
  yet publish an actual video stream to viewers (that requires a streaming
  backend like Agora, LiveKit, or Mux).
- Google/Phone login are UI simulations only — no real OAuth or SMS provider
  is connected yet.
