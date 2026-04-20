import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { useGuideStore } from '../../store/guideStore';
import NotificationCard from '../../components/NotificationCard';
import GuideOverlay from '../../components/GuideOverlay';

export default function NotificationsScreen({ navigation }) {
  const { user } = useAuthStore();
  const { seenGuides, isLoaded, loadGuides, markGuideSeen } = useGuideStore();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGuides();
  }, []);

  /**
   * Fetch only notifications for the logged-in student.
   */
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

  /**
   * When a notification is tapped:
   * - post notifications can take user to Home
   * - job/application notifications can try to load the related post
   */
  const handleNotificationPress = async (notification) => {
    try {
      if (
        (notification.reference_type === 'post' ||
          notification.reference_type === 'job_application') &&
        notification.reference_id
      ) {
        const { data: post, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', notification.reference_id)
          .single();

        // If the post no longer exists, still take student somewhere useful.
        if (error || !post) {
          navigation.navigate('HomeTab');
          return;
        }

        if (post.type === 'job') {
          navigation.navigate('HomeTab', {
            screen: 'JobDetail',
            params: { post },
          });
          return;
        }

        navigation.navigate('HomeTab');
        return;
      }

      navigation.navigate('HomeTab');
    } catch (error) {
      console.error('Notification press error:', error);
      Alert.alert('Error', 'Could not open this notification.');
    }
  };

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
              'This screen shows important updates sent to your account, including post updates and application progress.',
          },
          {
            heading: 'Tap to Open',
            description:
              'Tap a notification to jump to the related part of the app when available.',
          },
        ]}
        onFinish={() => markGuideSeen('notifications')}
      />

      <Text style={styles.header}>Notifications</Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
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