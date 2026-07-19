// functions/settings.js
//
// All rates live in Firestore's `settings/financial` doc, so you can change
// them from the Admin Dashboard without touching app code or redeploying.
// This helper just reads that doc with safe fallback defaults.

const admin = require('firebase-admin');

const DEFAULT_SETTINGS = {
  coinsPerPKR: 1000 / 300, // 1,000 Coins = 300 PKR
  hostSharePercent: 70,
  ownerSharePercent: 20,
  referrerSharePercent: 10,
  shellsToPKRRate: 10 / 100, // 100 Shells = 10 PKR
  dailySendingTargetCoins: 5000,
  dailyTargetBonusCoins: 200,
};

async function getFinancialSettings() {
  const snap = await admin.firestore().collection('settings').doc('financial').get();
  return snap.exists ? { ...DEFAULT_SETTINGS, ...snap.data() } : DEFAULT_SETTINGS;
}

module.exports = { getFinancialSettings, DEFAULT_SETTINGS };
