import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from './src/services/supabase';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function sendLocalTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification',
      body: 'Push notifications are working 🚀',
    },
    trigger: {
      seconds: 2,
    },
  });
}

export default function App() {
  useEffect(() => {
    async function testFetch() {
      const { data, error } = await supabase
        .from('posts')
        .select('*');

      if (error) {
        console.log('Supabase Error:', error.message);
      } else {
        console.log('Fetched Posts:', data);
      }
    }

    testFetch();
  }, []);

  useEffect(() => {
    sendLocalTestNotification();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camply Student App</Text>
      <Text>Check console for Supabase data!</Text>
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
});