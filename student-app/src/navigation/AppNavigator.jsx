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

/**
 * We keep a navigation ref so push-notification taps can navigate
 * even from outside a screen component.
 */
export const navigationRef = createNavigationContainerRef();

export default function AppNavigator() {
  const { user, isLoading, loadSession } = useAuthStore();
  const notificationResponseListener = useRef(null);

  useEffect(() => {
    loadSession();
  }, []);

  /**
   * Once a logged-in student is fully onboarded, register the device
   * for push notifications and save the Expo token to Supabase.
   */
  useEffect(() => {
    if (user && !user.is_first_login) {
      registerForPushNotifications(user);
    }
  }, [user]);

  /**
   * Handle taps on push notifications.
   * For now:
   * - post notifications take the user to Home
   * - application notifications also take the user to Home
   *
   * This keeps it useful and stable for pilot.
   */
  useEffect(() => {
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          const data = response?.notification?.request?.content?.data || {};

          if (!navigationRef.isReady()) return;

          if (
            data.notificationType === 'post' ||
            data.notificationType === 'application_status'
          ) {
            navigationRef.navigate('Notifications');
          } else {
            navigationRef.navigate('HomeTab');
          }
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