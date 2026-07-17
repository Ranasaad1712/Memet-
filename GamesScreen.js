// src/screens/GamesScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { COLORS } from '../theme/colors';

const GAMES = [
  {
    id: '1',
    icon: '🎯',
    title: 'Trivia Battle',
    description: 'Challenge your viewers live with rapid-fire trivia rounds.',
    tag: 'Coming Soon',
  },
  {
    id: '2',
    icon: '🎲',
    title: 'Lucky Wheel',
    description: 'Spin a prize wheel funded by viewer gifts in real time.',
    tag: 'Coming Soon',
  },
  {
    id: '3',
    icon: '🃏',
    title: 'Card Clash',
    description: 'Head-to-head card duels streamed straight to your audience.',
    tag: 'In Development',
  },
  {
    id: '4',
    icon: '🏆',
    title: 'Top Fan Race',
    description: 'Viewers compete to top the leaderboard during your stream.',
    tag: 'Coming Soon',
  },
  {
    id: '5',
    icon: '🎤',
    title: 'Sing-Off',
    description: 'Real-time karaoke duels judged live by chat votes.',
    tag: 'In Development',
  },
];

function GameCard({ item }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        Alert.alert(item.title, 'This mini-game is not available yet. Stay tuned!')
      }
    >
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        <View style={styles.tagPill}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function GamesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stream Games</Text>
        <Text style={styles.headerSubtitle}>
          Interactive mini-games to boost engagement on your streams
        </Text>
      </View>

      <FlatList
        data={GAMES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}
        renderItem={({ item }) => <GameCard item={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.white },
  headerSubtitle: { color: COLORS.secondaryText, marginTop: 6, fontSize: 13, lineHeight: 18 },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: { fontSize: 26 },
  cardBody: { flex: 1 },
  cardTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  cardDescription: { color: COLORS.secondaryText, fontSize: 12, marginTop: 4, lineHeight: 17 },
  tagPill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
});
