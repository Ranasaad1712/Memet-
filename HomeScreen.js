// src/screens/HomeScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { COLORS } from '../theme/colors';

const DUMMY_STREAMS = [
  {
    id: '1',
    name: 'Ayesha Malik',
    avatar: 'https://i.pravatar.cc/150?img=47',
    viewers: 1243,
    title: 'Late night Q&A 🌙',
  },
  {
    id: '2',
    name: 'Ahmed Khan',
    avatar: 'https://i.pravatar.cc/150?img=12',
    viewers: 876,
    title: 'Gaming marathon 🎮',
  },
  {
    id: '3',
    name: 'Fatima Ali',
    avatar: 'https://i.pravatar.cc/150?img=32',
    viewers: 2310,
    title: 'Cooking biryani live 🍛',
  },
  {
    id: '4',
    name: 'Hassan Raza',
    avatar: 'https://i.pravatar.cc/150?img=15',
    viewers: 542,
    title: 'Morning workout 💪',
  },
  {
    id: '5',
    name: 'Sara Iqbal',
    avatar: 'https://i.pravatar.cc/150?img=48',
    viewers: 1988,
    title: 'Makeup tutorial 💄',
  },
  {
    id: '6',
    name: 'Bilal Tariq',
    avatar: 'https://i.pravatar.cc/150?img=14',
    viewers: 342,
    title: 'Chill music session 🎧',
  },
];

function StreamCard({ item }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <Image source={{ uri: item.avatar }} style={styles.cardAvatar} />
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveBadgeText}>LIVE</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardViewers}>👁 {item.viewers.toLocaleString()} watching</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [messages, setMessages] = useState([
    { id: 'm1', user: 'Zainab', text: 'Welcome to the stream! 🎉' },
    { id: 'm2', user: 'Umar', text: 'Loving the vibe today 🔥' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const messageIdRef = useRef(3);

  const startLive = () => {
    setIsLive(true);
    setViewerCount(Math.floor(50 + Math.random() * 300));
  };

  const endLive = () => {
    setIsLive(false);
    setMessages([
      { id: 'm1', user: 'Zainab', text: 'Welcome to the stream! 🎉' },
      { id: 'm2', user: 'Umar', text: 'Loving the vibe today 🔥' },
    ]);
    setChatInput('');
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: `m${messageIdRef.current++}`,
      user: 'You',
      text: chatInput.trim(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  // ---------- LIVE STUDIO VIEW ----------
  if (isLive) {
    return (
      <View style={styles.studioContainer}>
        <CameraView facing="front" style={StyleSheet.absoluteFillObject} />

        {/* Top overlay: LIVE badge + viewer count */}
        <View style={styles.studioTopBar}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
          <View style={styles.viewerPill}>
            <Text style={styles.viewerPillText}>👁 {viewerCount.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.endButton} onPress={endLive}>
            <Text style={styles.endButtonText}>End Stream</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom overlay: rolling chat + input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.studioBottom}
        >
          <View style={styles.chatOverlay}>
            <FlatList
              data={messages.slice(-6)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Text style={styles.chatOverlayLine} numberOfLines={2}>
                  <Text style={styles.chatOverlayUser}>{item.user}: </Text>
                  {item.text}
                </Text>
              )}
            />
          </View>

          <View style={styles.studioInputRow}>
            <TextInput
              style={styles.studioInput}
              placeholder="Say something..."
              placeholderTextColor={COLORS.secondaryText}
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendArrow} onPress={sendMessage}>
              <Text style={styles.sendArrowText}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ---------- STREAM GRID / HUB VIEW ----------
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Memet <Text style={{ color: COLORS.gold }}>Live</Text></Text>
        <Text style={styles.headerSubtitle}>{DUMMY_STREAMS.length} creators live right now</Text>
      </View>

      <FlatList
        data={DUMMY_STREAMS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14 }}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => <StreamCard item={item} />}
      />

      <TouchableOpacity style={styles.goLiveButton} onPress={startLive} activeOpacity={0.85}>
        <Text style={styles.goLiveText}>🔴  Go Live</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.white },
  headerSubtitle: { color: COLORS.secondaryText, marginTop: 4, fontSize: 13 },

  grid: { paddingHorizontal: 16, paddingBottom: 110, gap: 14 },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 4,
  },
  cardAvatar: { width: '100%', height: 150 },
  cardInfo: { padding: 10 },
  cardName: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  cardTitle: { color: COLORS.secondaryText, fontSize: 12, marginTop: 2 },
  cardViewers: { color: COLORS.gold, fontSize: 11, marginTop: 6, fontWeight: '600' },

  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 5,
  },
  liveBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },

  goLiveButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: COLORS.gold,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  goLiveText: { color: COLORS.background, fontWeight: '800', fontSize: 16 },

  // Studio
  studioContainer: { flex: 1, backgroundColor: '#000' },
  studioTopBar: {
    position: 'absolute',
    top: 55,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewerPill: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  viewerPillText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  endButton: {
    marginLeft: 'auto',
    backgroundColor: COLORS.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  endButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },

  studioBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 24,
    paddingHorizontal: 14,
  },
  chatOverlay: {
    backgroundColor: COLORS.overlay,
    borderRadius: 14,
    padding: 10,
    maxHeight: 140,
    marginBottom: 10,
    width: '75%',
  },
  chatOverlayLine: { color: COLORS.white, fontSize: 13, marginVertical: 2 },
  chatOverlayUser: { color: COLORS.gold, fontWeight: '700' },

  studioInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  studioInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.white,
  },
  sendArrow: {
    backgroundColor: COLORS.gold,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendArrowText: { color: COLORS.background, fontSize: 16, fontWeight: '800' },
});
