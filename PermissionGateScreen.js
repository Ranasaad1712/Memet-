// src/screens/PermissionGateScreen.js
// Mandatory gate shown right after login. Requests Camera + Microphone access
// using expo-camera and expo-audio before the main app (tab navigator) loads.
//
// NOTE: expo-av was removed from the Expo SDK as of SDK 55 â€” audio recording
// permission now lives in expo-audio instead.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { requestRecordingPermissionsAsync } from 'expo-audio';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function PermissionGateScreen() {
  const { grantPermissions } = useAuth();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [requesting, setRequesting] = useState(false);

  const handleRequestPermissions = async () => {
    setRequesting(true);
    try {
      const camResult = await requestCameraPermission();
      const micResult = await requestRecordingPermissionsAsync();

      if (camResult.granted && micResult.granted) {
        grantPermissions();
      } else {
        Alert.alert(
          'Permissions required',
          'Memet Live needs Camera and Microphone access to let you go live and chat. Please enable both permissions to continue.'
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong while requesting permissions.');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>ðŸŽ¥ðŸŽ™ï¸</Text>
      <Text style={styles.title}>Enable Camera & Microphone</Text>
      <Text style={styles.subtitle}>
        To go live, chat, and connect with your audience, Memet Live needs access
        to your camera and microphone.
      </Text>

      {requesting ? (
        <ActivityIndicator color={COLORS.gold} size="large" style={{ marginTop: 30 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRequestPermissions}>
          <Text style={styles.buttonText}>Grant Access</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: { fontSize: 56, marginBottom: 20 },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  button: {
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: COLORS.background,
    fontWeight: '800',
    fontSize: 16,
  },
});
