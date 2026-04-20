import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

/**
 * Controls how notifications are displayed while the app is open.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Register the logged-in student device for Expo push notifications
 * and save the Expo push token into the students table.
 */
export async function registerForPushNotifications(user) {
  try {
    if (!user?.id) return null;

    // Push notifications need a real device.
    if (!Device.isDevice) {
      console.log('Push notifications require a real device.');
      return null;
    }

    // Android needs a channel for notifications.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    // Check existing permissions first.
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Ask user if not already granted.
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted.');
      return null;
    }

    // Pull the Expo project ID from app config.
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const pushToken = tokenResponse.data;

    // Save token against this student so admin-triggered pushes can reach them.
    const { error } = await supabase
      .from('students')
      .update({ push_token: pushToken })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to save push token:', error);
      return null;
    }

    return pushToken;
  } catch (error) {
    console.error('Push registration error:', error);
    return null;
  }
}