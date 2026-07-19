// functions/pkChallenge.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.sendPKChallenge = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  const { targetHostId } = data;
  const challengerId = context.auth.uid;

  const db = admin.firestore();
  const challengeRef = db.collection('pkChallenges').doc();
  await challengeRef.set({
    challengerId,
    targetHostId,
    status: 'pending', // pending | accepted | rejected | expired
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { challengeId: challengeRef.id };
});

exports.respondToPKChallenge = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  const { challengeId, accept } = data;
  const db = admin.firestore();
  const challengeRef = db.collection('pkChallenges').doc(challengeId);

  const challengeSnap = await challengeRef.get();
  if (!challengeSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Challenge no longer exists.');
  }
  const challenge = challengeSnap.data();
  if (challenge.targetHostId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Not your challenge to respond to.');
  }

  if (!accept) {
    await challengeRef.update({ status: 'rejected' });
    return { success: true, started: false };
  }

  // Accepted — create the live battle doc that PKBattleScreen listens to.
  const battleRef = db.collection('pkBattles').doc();
  await battleRef.set({
    hostAId: challenge.challengerId,
    hostBId: challenge.targetHostId,
    hostACoins: 0,
    hostBCoins: 0,
    status: 'active',
    winnerId: null,
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await challengeRef.update({ status: 'accepted', battleId: battleRef.id });

  return { success: true, started: true, battleId: battleRef.id };
});
