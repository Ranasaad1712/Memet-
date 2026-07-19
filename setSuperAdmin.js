// functions/setSuperAdmin.js
//
// Your request was to hardcode UID 240709 as Super Admin with unrestricted
// access "without needing any additional verification." Implementing that
// check purely in the React Native client would mean anyone who decompiles
// or patches the app could set their own local UID string to "240709" and
// grant themselves admin rights — a hardcoded client-side check has nothing
// stopping that. Firebase custom claims solve this correctly: the claim is
// signed into the user's auth token by Firebase's servers and cannot be
// forged client-side, while still requiring zero extra verification steps
// from the owner at sign-in — exactly the "no extra verification" behavior
// you asked for, just enforced where it can't be bypassed.
//
// Run this ONCE (e.g. via `firebase functions:shell` or a one-off admin
// script) after UID 240709 signs up for the first time.

const admin = require('firebase-admin');

const OWNER_UID = '240709';

async function grantSuperAdmin() {
  await admin.auth().setCustomUserClaims(OWNER_UID, {
    isSuperAdmin: true,
    isAdmin: true,
  });
  console.log(`Super admin claim granted to UID ${OWNER_UID}`);
}

module.exports = { grantSuperAdmin, OWNER_UID };

// Run directly with: node -e "require('./setSuperAdmin').grantSuperAdmin()"
// (after admin.initializeApp() has run in your entrypoint)
