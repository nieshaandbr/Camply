import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NotificationCard({ notification }) {
  // Format the date so notifications look cleaner and easier to scan.
  const formattedDate = new Date(notification.created_at).toLocaleString();

  return (
    <View style={styles.card}>
      <View style={styles.dot} />

      <View style={styles.content}>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.time}>{formattedDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#001DAF',
    marginRight: 14,
    marginTop: 6,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  time: {
    marginTop: 6,
    fontSize: 12,
    color: '#6b7280',
  },
});