// functions/banUser.js
//
// Callable Cloud Function — only an authenticated admin (checked via custom
// claim, see setSuperAdmin.js) may ban a user. The ban lives on the user's
// Firestore doc, keyed by their permanent 6-digit UID — NOT on the device,
// so clearing app cache/storage has zero effect on ban status.

const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.banUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }
  const callerClaims = context.auth.token;
  if (!callerClaims.isAdmin && !callerClaims.isSuperAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required.');
  }

  const { targetUid, reason, durationDays } = data; // durationDays: null = permanent
  if (!targetUid) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUid is required.');
  }

  const bannedUntil = durationDays
    ? admin.firestore.Timestamp.fromMillis(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    : null; // null = permanent ban

  await admin.firestore().collection('users').doc(targetUid).set(
    {
      status: 'banned',
      banReason: reason || 'Policy violation',
      bannedAt: admin.firestore.FieldValue.serverTimestamp(),
      bannedUntil, // null means permanent
      bannedBy: context.auth.uid,
    },
    { merge: true }
  );

  // Also revoke their existing Firebase Auth sessions immediately, so a
  // currently-open app can't keep acting as a signed-in user until the next
  // token refresh.
  await admin.auth().revokeRefreshTokens(targetUid);

  return { success: true };
});
