import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function NotificationCard({ notification, onPress }) {
  const formattedDate = new Date(notification.created_at).toLocaleString();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View
        style={[
          styles.dot,
          notification.notification_type === 'application_status'
            ? styles.applicationDot
            : styles.postDot,
        ]}
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          {notification.title || 'Notification'}
        </Text>

        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.time}>{formattedDate}</Text>
      </View>
    </TouchableOpacity>
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
    marginRight: 14,
    marginTop: 6,
  },
  postDot: {
    backgroundColor: '#1D3E6E',
  },
  applicationDot: {
    backgroundColor: '#16a34a',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 22,
  },
  time: {
    marginTop: 6,
    fontSize: 12,
    color: '#6b7280',
  },
});