import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import BottomTabNavigator from './BottomTabNavigator';

export default function AppNavigator() {
  const { user, isLoading, loadSession } = useAuthStore();

  // 🔄 Load session on app start
  useEffect(() => {
    loadSession();
  }, []);

  // ⏳ Show loading while checking session
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* 🔀 Conditional navigation */}
      {user ? <BottomTabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}