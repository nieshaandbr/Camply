import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { useGuideStore } from '../../store/guideStore';
import NotificationCard from '../../components/NotificationCard';
import GuideOverlay from '../../components/GuideOverlay';

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const { seenGuides, isLoaded, loadGuides, markGuideSeen } = useGuideStore();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGuides();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch notifications error:', error);
        setNotifications([]);
      } else {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error('Unexpected notifications error:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const showGuide = isLoaded && !seenGuides.notifications;

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#001DAF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GuideOverlay
        visible={showGuide}
        title="Notifications Guide"
        steps={[
          {
            heading: 'Your Alerts',
            description:
              'This screen shows important updates sent to your account, such as new posts from your university.',
          },
          {
            heading: 'Stay Updated',
            description:
              'Check this tab often so you do not miss jobs, announcements, or event updates.',
          },
        ]}
        onFinish={() => markGuideSeen('notifications')}
      />

      <Text style={styles.header}>Notifications</Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <NotificationCard notification={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchNotifications();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              New updates from your campus will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginBottom: 12,
    color: '#111827',
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});