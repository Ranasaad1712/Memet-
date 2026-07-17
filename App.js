// App.js
// Root entry point of Memet Live.
// Flow: AuthProvider -> Login -> Permission Gate (camera/mic) -> Bottom Tab Navigator

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import PermissionGateScreen from './src/screens/PermissionGateScreen';
import MainTabs from './src/navigation/MainTabs';
import { COLORS } from './src/theme/colors';

function RootNavigator() {
  const { isAuthenticated, permissionsGranted } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (!permissionsGranted) {
    return <PermissionGateScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.gold,
          background: COLORS.background,
          card: COLORS.surface,
          text: COLORS.white,
          border: COLORS.surface,
          notification: COLORS.gold,
        },
      }}
    >
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
