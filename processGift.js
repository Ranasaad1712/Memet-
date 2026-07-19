// functions/processGift.js
//
// Called whenever a viewer sends a gift. Runs the entire deduction + 3-way
// split inside a single Firestore transaction so a crash or race condition
// can never leave coins deducted without the corresponding shells credited
// (or vice versa).

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getFinancialSettings } = require('./settings');

exports.processGift = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
  }

  const senderId = context.auth.uid;
  const { hostId, giftValueCoins, battleId } = data; // battleId optional — set when sent during a PK battle
  if (!hostId || !giftValueCoins || giftValueCoins <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'hostId and giftValueCoins are required.');
  }

  const settings = await getFinancialSettings();
  const db = admin.firestore();

  const senderRef = db.collection('users').doc(senderId);
  const hostRef = db.collection('users').doc(hostId);

  const result = await db.runTransaction(async (tx) => {
    // All reads must happen before any writes in a Firestore transaction —
    // battleRef's read is grouped here with the others for that reason.
    const senderSnap = await tx.get(senderRef);
    const hostSnap = await tx.get(hostRef);
    const battleRef = battleId ? db.collection('pkBattles').doc(battleId) : null;
    const battleSnap = battleRef ? await tx.get(battleRef) : null;

    if (!senderSnap.exists) throw new functions.https.HttpsError('not-found', 'Sender not found.');
    if (!hostSnap.exists) throw new functions.https.HttpsError('not-found', 'Host not found.');

    const senderData = senderSnap.data();
    if ((senderData.coinBalance || 0) < giftValueCoins) {
      throw new functions.https.HttpsError('failed-precondition', 'insufficientBalance');
    }

    // Whole-number shell split — remainder (from rounding) stays with the
    // owner rather than being silently lost.
    const hostShells = Math.floor((giftValueCoins * settings.hostSharePercent) / 100);
    const referrerShells = Math.floor((giftValueCoins * settings.referrerSharePercent) / 100);
    const ownerShells = giftValueCoins - hostShells - referrerShells;

    const hostData = hostSnap.data();
    const referrerId = hostData.referredBy || null;

    tx.update(senderRef, {
      coinBalance: admin.firestore.FieldValue.increment(-giftValueCoins),
    });
    tx.update(hostRef, {
      shellBalance: admin.firestore.FieldValue.increment(hostShells),
      dailySentCoinsReceived: admin.firestore.FieldValue.increment(giftValueCoins),
    });

    // Owner's running profit total, read by the Admin Dashboard in real time.
    tx.set(
      db.collection('settings').doc('financial'),
      { totalOwnerProfitShells: admin.firestore.FieldValue.increment(ownerShells) },
      { merge: true }
    );

    if (referrerId) {
      const referrerRef = db.collection('users').doc(referrerId);
      tx.update(referrerRef, {
        shellBalance: admin.firestore.FieldValue.increment(referrerShells),
      });
    } else {
      // No referrer — that share goes to the owner instead of vanishing.
      tx.set(
        db.collection('settings').doc('financial'),
        { totalOwnerProfitShells: admin.firestore.FieldValue.increment(referrerShells) },
        { merge: true }
      );
    }

    // If this gift was sent during a live PK battle, update that battle's
    // running score in the same atomic transaction — this is what drives
    // PKBattleScreen's real-time progress bar for both hosts.
    if (battleSnap?.exists) {
      const battleData = battleSnap.data();
      const field = battleData.hostAId === hostId ? 'hostACoins' : 'hostBCoins';
      tx.update(battleRef, { [field]: admin.firestore.FieldValue.increment(giftValueCoins) });
    }

    return { hostShells, ownerShells, referrerShells, referrerId };
  });

  // Daily sending target bonus check — outside the transaction since it's a
  // separate concern and doesn't need to be atomic with the gift itself.
  const hostSnapAfter = await hostRef.get();
  const hostDataAfter = hostSnapAfter.data();
  if (
    hostDataAfter.dailySentCoinsReceived >= settings.dailySendingTargetCoins &&
    !hostDataAfter.dailyBonusClaimedToday
  ) {
    await hostRef.update({
      coinBalance: admin.firestore.FieldValue.increment(settings.dailyTargetBonusCoins),
      dailyBonusClaimedToday: true,
    });
  }

  return { success: true, ...result };
});
