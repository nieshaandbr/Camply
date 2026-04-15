import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { useGuideStore } from '../../store/guideStore';
import PostCard from '../../components/PostCard';
import GuideOverlay from '../../components/GuideOverlay';

const FILTERS = ['all', 'announcement', 'event', 'job'];

export default function HomeFeedScreen({ navigation }) {
  const { user } = useAuthStore();
  const { seenGuides, isLoaded, loadGuides, markGuideSeen } = useGuideStore();

  const [posts, setPosts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGuides();
  }, []);

  const fetchPosts = async () => {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('university_id', user.university_id)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch posts error:', error);
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      console.error('Unexpected fetch posts error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (selectedFilter === 'all') return posts;
    return posts.filter((post) => post.type === selectedFilter);
  }, [posts, selectedFilter]);

  const showGuide = isLoaded && !seenGuides.home_feed;

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#1D3E6E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GuideOverlay
        visible={showGuide}
        title="Home Feed Guide"
        steps={[
          {
            heading: 'Feed Header',
            description:
              'This is your main campus feed. It shows the latest updates from your university in one place.',
          },
          {
            heading: 'Filters',
            description:
              'Use these filters to quickly switch between announcements, events, jobs, or all posts.',
          },
          {
            heading: 'Posts',
            description:
              'Tap job posts to apply, and use event buttons to open ticket or registration links when available.',
          },
        ]}
        onFinish={() => markGuideSeen('home_feed')}
      />

      <View style={styles.headerWrap}>
        <Text style={styles.header}>Camply</Text>
        <Text style={styles.subHeader}>Your university updates in one place</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const isActive = selectedFilter === filter;

          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, isActive && styles.activeFilterChip]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                {formatFilterLabel(filter)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostCard post={item} navigation={navigation} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPosts();
            }}
            tintColor="#1D3E6E"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptyText}>
              {selectedFilter === 'all'
                ? 'New campus updates will appear here.'
                : `There are no ${formatFilterLabel(selectedFilter).toLowerCase()} posts right now.`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function formatFilterLabel(filter) {
  switch (filter) {
    case 'announcement':
      return 'Announcements';
    case 'event':
      return 'Events';
    case 'job':
      return 'Jobs';
    default:
      return 'All';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerWrap: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D3E6E',
  },
  subHeader: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: '#f8fafc',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
  },
  activeFilterChip: {
    backgroundColor: '#1D3E6E',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111827',
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});