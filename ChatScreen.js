// src/screens/ChatScreen.js
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
import { COLORS } from '../theme/colors';

const CONVERSATIONS = [
  {
    id: '1',
    name: 'Ahmed Khan',
    avatar: 'https://i.pravatar.cc/150?img=12',
    lastMessage: 'See you on stream tonight!',
    time: '2m',
    online: true,
    messages: [
      { id: 'a1', from: 'them', text: 'Hey! Are you streaming today?' },
      { id: 'a2', from: 'me', text: 'Yes, going live at 8pm 🎥' },
      { id: 'a3', from: 'them', text: 'See you on stream tonight!' },
    ],
  },
  {
    id: '2',
    name: 'Fatima Ali',
    avatar: 'https://i.pravatar.cc/150?img=32',
    lastMessage: 'That biryani stream was amazing 😍',
    time: '15m',
    online: true,
    messages: [
      { id: 'b1', from: 'them', text: 'That biryani stream was amazing 😍' },
      { id: 'b2', from: 'me', text: 'Haha thank you! Recipe is on my profile' },
    ],
  },
  {
    id: '3',
    name: 'Ayesha Malik',
    avatar: 'https://i.pravatar.cc/150?img=47',
    lastMessage: 'Can you shoutout my channel?',
    time: '1h',
    online: false,
    messages: [
      { id: 'c1', from: 'them', text: 'Can you shoutout my channel?' },
      { id: 'c2', from: 'me', text: 'Of course, sending some love your way!' },
    ],
  },
  {
    id: '4',
    name: 'Hassan Raza',
    avatar: 'https://i.pravatar.cc/150?img=15',
    lastMessage: 'GG on the game stream 🔥',
    time: '3h',
    online: false,
    messages: [{ id: 'd1', from: 'them', text: 'GG on the game stream 🔥' }],
  },
];

export default function ChatScreen() {
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const messageIdRef = useRef(100);

  const activeChat = conversations.find((c) => c.id === activeChatId);

  const openChat = (id) => setActiveChatId(id);
  const goBack = () => {
    setActiveChatId(null);
    setMessageInput('');
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !activeChatId) return;
    const newMsg = {
      id: `m${messageIdRef.current++}`,
      from: 'me',
      text: messageInput.trim(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.text,
              time: 'now',
            }
          : c
      )
    );
    setMessageInput('');
  };

  // ---------- PRIVATE CHAT ROOM VIEW ----------
  if (activeChat) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.roomHeader}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Image source={{ uri: activeChat.avatar }} style={styles.roomAvatar} />
          <View>
            <Text style={styles.roomName}>{activeChat.name}</Text>
            <Text style={styles.roomStatus}>
              {activeChat.online ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <FlatList
          data={activeChat.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.from === 'me' ? styles.bubbleMine : styles.bubbleTheirs,
              ]}
            >
              <Text
                style={
                  item.from === 'me' ? styles.bubbleTextMine : styles.bubbleTextTheirs
                }
              >
                {item.text}
              </Text>
            </View>
          )}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.secondaryText}
            value={messageInput}
            onChangeText={setMessageInput}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ---------- CHAT LIST VIEW ----------
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openChat(item.id)}>
            <View>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              {item.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            <Text style={styles.rowTime}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.white },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.online,
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  rowText: { flex: 1, marginLeft: 14 },
  rowName: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  rowMessage: { color: COLORS.secondaryText, fontSize: 13, marginTop: 3 },
  rowTime: { color: COLORS.secondaryText, fontSize: 12 },

  // Room
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
    gap: 12,
  },
  backButton: { padding: 4 },
  backArrow: { color: COLORS.gold, fontSize: 22, fontWeight: '700' },
  roomAvatar: { width: 42, height: 42, borderRadius: 21 },
  roomName: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  roomStatus: { color: COLORS.secondaryText, fontSize: 12 },

  messageList: { padding: 16, gap: 10 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginVertical: 4 },
  bubbleMine: {
    backgroundColor: COLORS.gold,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: COLORS.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleTextMine: { color: COLORS.background, fontSize: 14, fontWeight: '600' },
  bubbleTextTheirs: { color: COLORS.white, fontSize: 14 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.white,
  },
  sendButton: {
    backgroundColor: COLORS.gold,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: { color: COLORS.background, fontSize: 16, fontWeight: '800' },
});
