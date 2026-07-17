// src/screens/LoginScreen.js
import React, { useState } from 'react';
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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(null);

  const handleEmailLogin = () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }
    login({ name: email.split('@')[0] || 'Streamer', email, method: 'email' });
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 7) {
      Alert.alert('Invalid number', 'Please enter a valid phone number.');
      return;
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    Alert.alert('OTP Sent (Simulated)', `Your code is ${code}`);
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      login({ name: `User ${phone.slice(-4)}`, phone, method: 'phone' });
    } else {
      Alert.alert('Incorrect code', 'Please check the OTP and try again.');
    }
  };

  const handleGoogleLogin = () => {
    login({ name: 'Google User', email: 'googleuser@gmail.com', method: 'google' });
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
            placeholder="Phone number"
            placeholderTextColor={COLORS.secondaryText}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={!otpSent}
          />
          {!otpSent ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSendOtp}>
              <Text style={styles.secondaryButtonText}>Send OTP</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                placeholderTextColor={COLORS.secondaryText}
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
              />
              <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtp}>
                <Text style={styles.primaryButtonText}>Verify & Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendOtp}>
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
