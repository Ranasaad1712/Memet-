// src/screens/PKBattleScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const BATTLE_DURATION_SECONDS = 5 * 60;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Expects a Firestore doc at `pkBattles/{battleId}` shaped like:
 *   {
 *     hostAId, hostBId, hostAName, hostBName,
 *     hostACoins, hostBCoins,          // updated by processGift when a gift
 *                                      // is tagged with this battleId
 *     startedAt: Timestamp,
 *     status: 'active' | 'ended',
 *     winnerId: string | null,
 *   }
 */
export default function PKBattleScreen({ route }) {
  const battleId = route?.params?.battleId;
  const [battle, setBattle] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(BATTLE_DURATION_SECONDS);
  const barAnim = useRef(new Animated.Value(0.5)).current; // 0 = all B, 1 = all A
  const winnerScale = useRef(new Animated.Value(0)).current;

  // Live battle data (coin counts update in real time as gifts land).
  useEffect(() => {
    if (!battleId) return;
    const unsubscribe = onSnapshot(doc(db, 'pkBattles', battleId), (snap) => {
      setBattle(snap.data());
    });
    return unsubscribe;
  }, [battleId]);

  // Countdown timer, derived from startedAt so it's correct even if the
  // screen remounts mid-battle (not just a naive local setInterval from 300).
  useEffect(() => {
    if (!battle?.startedAt) return;
    const startMs = battle.startedAt.toMillis();

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      const remaining = Math.max(0, BATTLE_DURATION_SECONDS - elapsed);
      setSecondsLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [battle?.startedAt]);

  // Animate the progress bar smoothly toward the current coin ratio.
  useEffect(() => {
    if (!battle) return;
    const total = (battle.hostACoins || 0) + (battle.hostBCoins || 0);
    const ratio = total > 0 ? (battle.hostACoins || 0) / total : 0.5;
    Animated.timing(barAnim, {
      toValue: ratio,
      duration: 400,
      useNativeDriver: false, // animating a width percentage, not transform
    }).start();
  }, [battle?.hostACoins, battle?.hostBCoins]);

  // Winner pop-in animation once the timer hits zero.
  useEffect(() => {
    if (secondsLeft === 0 && battle?.status === 'active') {
      Animated.spring(winnerScale, { toValue: 1, useNativeDriver: true, friction: 4 }).start();
      // In production, the *server* (a scheduled/callable function watching
      // battle end times) should flip status -> 'ended' and set winnerId —
      // never decide the winner purely on-device.
    }
  }, [secondsLeft, battle?.status]);

  if (!battle) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading battle…</Text>
      </View>
    );
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');
  const isEnded = battle.status === 'ended' || secondsLeft === 0;
  const winnerName = battle.winnerId === battle.hostAId ? battle.hostAName : battle.hostBName;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFillA,
            {
              width: barAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <View style={styles.coinsRow}>
        <Text style={styles.coinsText}>{battle.hostACoins || 0}</Text>
        <Text style={styles.timerText}>{minutes}:{seconds}</Text>
        <Text style={styles.coinsText}>{battle.hostBCoins || 0}</Text>
      </View>

      {/* Split dual stream */}
      <View style={styles.splitContainer}>
        <View style={[styles.streamHalf, isEnded && battle.winnerId !== battle.hostAId && styles.dimmed]}>
          {/* Real video stream component for hostAId goes here */}
          <Text style={styles.hostLabel}>{battle.hostAName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={[styles.streamHalf, isEnded && battle.winnerId !== battle.hostBId && styles.dimmed]}>
          {/* Real video stream component for hostBId goes here */}
          <Text style={styles.hostLabel}>{battle.hostBName}</Text>
        </View>
      </View>

      {isEnded && (
        <Animated.View style={[styles.winnerBanner, { transform: [{ scale: winnerScale }] }]}>
          <Text style={styles.winnerText}>🏆 {winnerName} Wins!</Text>
          <Text style={styles.finalScoreText}>
            {battle.hostACoins || 0} — {battle.hostBCoins || 0}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  loadingText: { color: '#888' },

  barTrack: {
    height: 10,
    backgroundColor: '#ff4d6d', // hostB base color; hostA fill overlays from the left
    marginTop: 50,
    marginHorizontal: 12,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFillA: { height: '100%', backgroundColor: '#4169E1' }, // hostA color

  coinsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 6,
  },
  coinsText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  timerText: { color: '#FFD700', fontWeight: '800', fontSize: 16 },

  splitContainer: { flex: 1, flexDirection: 'row' },
  streamHalf: {
    width: SCREEN_WIDTH / 2,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  dimmed: { opacity: 0.35 },
  divider: { width: 2, backgroundColor: '#FFD700' },
  hostLabel: { color: '#fff', fontWeight: '700' },

  winnerBanner: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 16,
    alignItems: 'center',
  },
  winnerText: { color: '#FFD700', fontSize: 22, fontWeight: '800' },
  finalScoreText: { color: '#fff', marginTop: 6, fontSize: 16 },
});
