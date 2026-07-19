// src/components/RecaptchaModal.js
//
// Renders the Firebase Hosting reCAPTCHA page (firebase-hosting/public/recaptcha.html)
// inside a WebView modal, and exposes an imperative `verify()` method that
// resolves with the reCAPTCHA response token once the user completes it.
//
// IMPORTANT: replace RECAPTCHA_PAGE_URL below with your deployed Firebase
// Hosting URL after running `firebase deploy --only hosting` from the
// `firebase-hosting/` folder (e.g. https://memet-live.web.app/recaptcha.html).

import React, { forwardRef, useImperativeHandle, useState, useRef, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../theme/colors';
import { firebaseConfig } from '../config/firebaseConfig';

// TODO: set this to your deployed Firebase Hosting URL.
const RECAPTCHA_PAGE_URL = 'https://memet-live.web.app/recaptcha.html';

function buildRecaptchaUri() {
  const encodedConfig = btoa(JSON.stringify(firebaseConfig));
  return `${RECAPTCHA_PAGE_URL}?config=${encodeURIComponent(encodedConfig)}`;
}

const RecaptchaModal = forwardRef((_props, ref) => {
  const [visible, setVisible] = useState(false);
  const [webviewKey, setWebviewKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const pendingRef = useRef(null); // { resolve, reject }

  const closeAndSettle = useCallback((fn, arg) => {
    setVisible(false);
    setLoading(true);
    if (pendingRef.current) {
      fn(arg);
      pendingRef.current = null;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    // Returns a Promise<string> resolving with the reCAPTCHA token.
    verify() {
      return new Promise((resolve, reject) => {
        pendingRef.current = { resolve, reject };
        setWebviewKey((k) => k + 1); // force a fresh widget instance each time
        setLoading(true);
        setVisible(true);
      });
    },
  }));

  const handleMessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch (e) {
      return;
    }

    if (data.type === 'success' && data.token) {
      closeAndSettle((p) => p.resolve(data.token), pendingRef.current);
    } else if (data.type === 'expired') {
      closeAndSettle((p) => p.reject(new Error('reCAPTCHA expired, please try again')), pendingRef.current);
    } else if (data.type === 'error') {
      closeAndSettle((p) => p.reject(new Error(data.message || 'reCAPTCHA failed')), pendingRef.current);
    }
  };

  const handleCancel = () => {
    closeAndSettle((p) => p.reject(new Error('Verification cancelled')), pendingRef.current);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Quick verification</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.webviewWrapper}>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={COLORS.gold} size="large" />
              </View>
            )}
            <WebView
              key={webviewKey}
              source={{ uri: buildRecaptchaUri() }}
              onMessage={handleMessage}
              onLoadEnd={() => setLoading(false)}
              style={styles.webview}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default RecaptchaModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '55%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  title: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  cancel: { color: COLORS.gold, fontWeight: '600', fontSize: 14 },
  webviewWrapper: { flex: 1 },
  webview: { flex: 1, backgroundColor: COLORS.background },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
