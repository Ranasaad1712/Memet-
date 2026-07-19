// functions/resetDailyCounters.js
//
// Without this, dailySentCoinsReceived/dailyBonusClaimedToday would only
// ever reset once — hosts could only ever claim the bonus a single time in
// the app's whole lifetime. Deploy this as a scheduled function running once
// daily (e.g. midnight in your target timezone).

const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.resetDailyCounters = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Karachi')
  .onRun(async () => {
    const db = admin.firestore();
    const usersSnap = await db.collection('users').get();

    const batchSize = 400; // stay safely under Firestore's 500-op batch limit
    let batch = db.batch();
    let count = 0;

    for (const doc of usersSnap.docs) {
      batch.update(doc.ref, {
        dailySentCoinsReceived: 0,
        dailyBonusClaimedToday: false,
        dailyLiveStreamSeconds: 0,
        dailyPartyRoomSeconds: 0,
      });
      count++;
      if (count === batchSize) {
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
    }
    if (count > 0) await batch.commit();

    return null;
  });
