// src/screens/BannedScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BannedScreen({ banInfo }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🚫</Text>
      <Text style={styles.title}>Access Denied</Text>
      <Text style={styles.message}>Your account has been suspended.</Text>
      {banInfo?.reason && <Text style={styles.reason}>Reason: {banInfo.reason}</Text>}
      {banInfo?.bannedUntil && (
        <Text style={styles.reason}>
          Ban expires: {banInfo.bannedUntil.toDate().toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0c1b', padding: 24 },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  message: { color: '#b3b3b3', fontSize: 15, textAlign: 'center' },
  reason: { color: '#888', fontSize: 12, marginTop: 12 },
});
