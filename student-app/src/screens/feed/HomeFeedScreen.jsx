import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';

import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import PostCard from '../../components/PostCard';

export default function HomeFeedScreen({ navigation }) {
  const { user } = useAuthStore();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const now = new Date().toISOString();

      // This query only shows posts for the student's university
      // and hides expired posts automatically.
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

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#001DAF" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Camply</Text>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard post={item} navigation={navigation} />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPosts();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>
              New campus updates will appear here.
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
    backgroundColor: '#f8fafc', // softer background
  },

  header: {
    fontSize: 24,
    fontWeight: '800',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },

  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
  },
});