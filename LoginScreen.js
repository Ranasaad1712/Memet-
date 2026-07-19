// src/screens/LoginScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';
import RecaptchaModal from '../components/RecaptchaModal';
import { createWebviewRecaptchaVerifier, sendOtp, confirmOtp, isValidE164 } from '../services/phoneAuth';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const recaptchaRef = useRef(null);
  const confirmationResultRef = useRef(null);

  const handleEmailLogin = () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }
    // Now this correctly calls the Firebase login function
    login(email, password);
  };

  const handleSendOtp = async () => {
    if (!isValidE164(phone)) {
      Alert.alert(
        'Invalid number',
        'Enter your number in international format, e.g. +14155552671'
      );
      return;
    }

    setSendingOtp(true);
    try {
      // Opens the WebView modal, waits for the user to complete the challenge
      const verifier = createWebviewRecaptchaVerifier(() => recaptchaRef.current.verify());
      const confirmationResult = await sendOtp(phone, verifier);
      confirmationResultRef.current = confirmationResult;
      setOtpSent(true);
      Alert.alert('Code sent', `We texted a verification code to ${phone}`);
    } catch (err) {
      Alert.alert('Could not send code', err.message || 'Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    try {
      const userCredential = await confirmOtp(confirmationResultRef.current, otp);
      const user = userCredential.user;
      
      // Phone login implementation
      login({
        name: user.displayName || `User ${phone.slice(-4)}`,
        phone: user.phoneNumber || phone,
        uid: user.uid,
        method: 'phone',
      });
    } catch (err) {
      Alert.alert('Incorrect code', err.message || 'Please check the code and try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Notice", "Google login will be connected soon!");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Memet <Text style={{ color: COLORS.gold }}>Live</Text></Text>
        <Text style={styles.subtitle}>Stream. Chat. Connect.</Text>

        {/* Email / Password */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sign in with Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={COLORS.secondaryText}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.secondaryText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleEmailLogin}>
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Phone / OTP */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sign in with Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="+14155552671"
            placeholderTextColor={COLORS.secondaryText}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={!otpSent}
          />
          {!otpSent ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSendOtp}
              disabled={sendingOtp}
            >
              {sendingOtp ? (
                <ActivityIndicator color={COLORS.gold} />
              ) : (
                <Text style={styles.secondaryButtonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor={COLORS.secondaryText}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleVerifyOtp}
                disabled={verifyingOtp}
              >
                {verifyingOtp ? (
                  <ActivityIndicator color={COLORS.background} />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendOtp} disabled={sendingOtp}>
                <Text style={styles.resend}>Resend code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Google */}
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Text style={styles.googleButtonText}>G  Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          By continuing you agree to Memet Live's Terms & Privacy Policy.
        </Text>
      </ScrollView>

      <RecaptchaModal ref={recaptchaRef} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24, paddingTop: 80, paddingBottom: 40 },
  logo: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 32,
    fontSize: 15,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.white,
    marginBottom: 12,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: COLORS.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.gold,
    fontWeight: '700',
    fontSize: 15,
  },
  resend: {
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  googleButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  googleButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
  footerNote: {
    color: COLORS.secondaryText,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
});
      
