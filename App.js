// Root entry point of Memet Live.
// Flow: AuthProvider -> Login -> Permission Gate (camera/mic) -> Bottom Tab Navigator

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import PermissionGateScreen from './src/screens/PermissionGateScreen';
import MainTabs from './src/navigation/MainTabs';
import { COLORS } from './src/theme/colors';

// React Navigation v7 requires a `fonts` object on any custom theme passed to
// NavigationContainer — spreading the built-in DarkTheme picks up the correct
// platform fonts automatically, and we only override the colors we care about.
const MemetNavigationTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.gold,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.white,
    border: COLORS.surface,
    notification: COLORS.gold,
  },
};

function RootNavigator() {
  const { isAuthenticated, permissionsGranted } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (!permissionsGranted) {
    return <PermissionGateScreen />;
  }

  return (
    <NavigationContainer theme={MemetNavigationTheme}>
      <MainTabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
