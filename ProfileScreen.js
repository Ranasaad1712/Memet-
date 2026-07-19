// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Memet Streamer';
  const displaySub = user?.email || user?.phoneNumber || 'Verified User';

  // Dynamic stats mapping
  const stats = [
    { label: 'Followers', value: user?.followers || '0' },
    { label: 'Following', value: user?.following || '0' },
    { label: 'Streams', value: user?.streams || '0' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.subtext}>{displaySub}</Text>

        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>⭐ Level 7 Streamer</Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.menuCard}>
        <MenuRow icon="📊" label="Streaming Statistics" />
        <MenuRow icon="🎁" label="Gifts & Earnings" />
        <MenuRow icon="⚙️" label="Account Settings" />
        <MenuRow icon="🛡️" label="Privacy & Safety" />
        <MenuRow icon="❓" label="Help & Support" />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>App Status</Text>
        <Text style={styles.statusText}>Memet Live v1.0.0 - All systems operational ✅</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function MenuRow({ icon, label }) {
  return (
    <View style={styles.menuRow}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>❯</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.white },
  profileCard: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: COLORS.gold },
  name: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginTop: 12 },
  subtext: { color: COLORS.secondaryText, fontSize: 13, marginTop: 2 },
  levelBadge: { marginTop: 12, backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  levelBadgeText: { color: COLORS.gold, fontWeight: '700', fontSize: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 20, backgroundColor: COLORS.surface, borderRadius: 16, paddingVertical: 16, marginTop: 20, width: '90%' },
  statBox: { alignItems: 'center' },
  statValue: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  statLabel: { color: COLORS.secondaryText, fontSize: 12, marginTop: 4 },
  menuCard: { backgroundColor: COLORS.surface, borderRadius: 16, marginHorizontal: 20, marginTop: 20, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.background },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuLabel: { color: COLORS.white, fontSize: 14, flex: 1 },
  menuArrow: { color: COLORS.secondaryText, fontSize: 20 },
  statusCard: { backgroundColor: COLORS.surface, borderRadius: 16, marginHorizontal: 20, marginTop: 20, padding: 16 },
  statusTitle: { color: COLORS.gold, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  statusText: { color: COLORS.secondaryText, fontSize: 13 },
  logoutButton: { marginHorizontal: 20, marginTop: 24, backgroundColor: COLORS.danger, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  logoutText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
    
