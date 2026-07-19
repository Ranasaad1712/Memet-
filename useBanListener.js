// src/hooks/useBanListener.js
//
// Attaches a live Firestore listener on the current user's doc — this fires
// immediately on every app launch AND in real time if an admin bans them
// mid-session (no need to wait for the next launch). Enforcement lives
// entirely in Firestore, keyed by the permanent 6-digit UID, so clearing
// app cache/AsyncStorage/reinstalling has no effect — the ban re-applies
// the moment they sign back in with the same account.

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';

export function useBanListener() {
  const [banInfo, setBanInfo] = useState(null); // null = not banned

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', uid), async (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      const isBanned =
        data.status === 'banned' &&
        (data.bannedUntil === null || data.bannedUntil.toMillis() > Date.now());

      if (isBanned) {
        setBanInfo({ reason: data.banReason, bannedUntil: data.bannedUntil });
        await signOut(auth); // force logout immediately
      }
    });

    return unsubscribe;
  }, []);

  return banInfo; // show the "Access Denied" message when this is non-null
}

export default useBanListener;
