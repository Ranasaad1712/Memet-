// src/config/firebaseConfig.js
//
// Firebase setup for Memet Live.
// - Auth persistence uses @react-native-async-storage/async-storage so users
//   stay logged in across app restarts (this part is fully supported and safe).
// - Phone (OTP) auth via Firebase's built-in provider needs a reCAPTCHA
//   verifier tied to a real DOM element, which does not exist in React
//   Native. See the note below the exports before wiring up sendOtp/verifyOtp.
//
// Install:
//   npx expo install firebase @react-native-async-storage/async-storage

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAsNSik_RWzJxL3abIjB17r...', // paste your full key here
  authDomain: 'memet-live.firebaseapp.com',
  projectId: 'memet-live',
  storageBucket: 'memet-live.firebasestorage.app',
  messagingSenderId: '855381614030',
  appId: '1:855381614030:web:e8b4181a0f...', // paste your full app ID here
  measurementId: 'G-KEY3SLSPTM',
};

// Prevent re-initializing the app on Fast Refresh / repeated imports.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth must be initialized once, with AsyncStorage persistence, before any
// other file calls getAuth(). Guard against re-initialization the same way.
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // initializeAuth throws if it's already been called once (e.g. Fast Refresh
  // in dev). Fall back to the existing instance instead of crashing.
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
export default app;

/**
 * ── Phone (OTP) authentication — read before using ──────────────────────
 *
 * Firebase's built-in phone auth (`signInWithPhoneNumber`, `RecaptchaVerifier`)
 * requires a real browser DOM to render its reCAPTCHA challenge. There is no
 * DOM in React Native, so calling it directly here will not work — it will
 * throw or hang, not silently "just work."
 *
 * Three real ways to get OTP login working in this Expo app:
 *
 * 1. @react-native-firebase/auth — native module with built-in phone auth
 *    support. Requires a custom Expo dev client (`expo prebuild` +
 *    `expo run:android` / `expo run:ios`), not Expo Go.
 *
 * 2. A WebView-hosted reCAPTCHA — render Firebase's reCAPTCHA widget inside
 *    an `expo-webview`, get a verified token back via postMessage, then pass
 *    that into `signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)`.
 *
 * 3. Skip Firebase's phone provider entirely — send your own OTP via a
 *    Cloud Function + an SMS API (Twilio, MessageBird, etc.), then just use
 *    Firebase Auth's custom-token sign-in once the code is verified.
 *
 * Tell me which direction you want and I'll build out the actual sendOtp /
 * verifyOtp functions and wire them into LoginScreen.js — the current OTP
 * button there is still the local simulator from before.
 */
