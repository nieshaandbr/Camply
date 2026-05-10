import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from './src/services/supabase';

// 1. Notification Handler Configuration
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 2. Function to get permissions and the Expo Push Token
async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Uses the Project ID from your app.json
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export default function App() {
  useEffect(() => {
    // A. Fetch posts for debugging
    async function testFetch() {
      const { data, error } = await supabase.from('posts').select('*');
      if (error) {
        console.log('Supabase Error:', error.message);
      } else {
        console.log('Fetched Posts:', data);
      }
    }

    // B. Handle Push Token Generation and Saving
    async function setupNotifications() {
      const token = await registerForPushNotificationsAsync();
      
      if (token) {
        console.log('Your Expo Push Token:', token);
        async function setupNotifications() {
      const token = await registerForPushNotificationsAsync();
      
      if (token) {
        console.log('Your Expo Push Token:', token);

        // 1. Get the currently logged-in student's ID
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // 2. Update the push_token column for this specific student
          const { error } = await supabase
            .from('students') // Make sure this matches your table name
            .update({ push_token: token })
            .eq('id', university_id); 

          if (error) {
            console.log('Error saving token to Supabase:', error.message);
          } else {
            console.log('Push token successfully saved to database!');
          }
        } else {
          console.log('No user logged in. Token not saved.');
        }
      }
    }
      }
      if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
  });
}
    }

    testFetch();
    setupNotifications();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camply Student App</Text>
      <Text>Checking for notifications and posts...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});