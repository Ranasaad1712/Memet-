// functions/endExpiredBattles.js
//
// The client's countdown timer is purely a display — the WINNER must be
// decided here, server-side, not by whichever client's timer reaches zero
// first (client clocks can drift or be manipulated). Runs every minute and
// closes out any battle whose 5-minute window has elapsed.

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const BATTLE_DURATION_MS = 5 * 60 * 1000;

exports.endExpiredBattles = functions.pubsub.schedule('every 1 minutes').onRun(async () => {
  const db = admin.firestore();
  const activeBattlesSnap = await db.collection('pkBattles').where('status', '==', 'active').get();

  const now = Date.now();
  const updates = [];

  activeBattlesSnap.forEach((doc) => {
    const battle = doc.data();
    const startedMs = battle.startedAt?.toMillis?.() ?? 0;
    if (now - startedMs >= BATTLE_DURATION_MS) {
      const hostACoins = battle.hostACoins || 0;
      const hostBCoins = battle.hostBCoins || 0;
      const winnerId =
        hostACoins === hostBCoins ? null : hostACoins > hostBCoins ? battle.hostAId : battle.hostBId;

      updates.push(doc.ref.update({ status: 'ended', winnerId, endedAt: admin.firestore.FieldValue.serverTimestamp() }));
    }
  });

  await Promise.all(updates);
  return null;
});
