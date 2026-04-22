import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { useAuthStore } from '../store/authStore';

import LoginScreen from '../screens/auth/LoginScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { registerForPushNotifications } from '../services/notifications';

export const navigationRef = createNavigationContainerRef();

export default function AppNavigator() {
  const { user, isLoading, loadSession } = useAuthStore();
  const notificationResponseListener = useRef(null);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (user && !user.is_first_login) {
      registerForPushNotifications(user);
    }
  }, [user]);

  // When the phone notification popup is tapped, take student to Notifications tab.
  useEffect(() => {
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener(() => {
        try {
          if (!navigationRef.isReady()) return;
          navigationRef.navigate('Notifications');
        } catch (error) {
          console.error('Notification tap handling error:', error);
        }
      });

    return () => {
      if (notificationResponseListener.current) {
        notificationResponseListener.current.remove();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1D3E6E" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {!user ? (
        <LoginScreen />
      ) : user.is_first_login ? (
        <ChangePasswordScreen />
      ) : (
        <BottomTabNavigator />
      )}
    </NavigationContainer>
  );
}