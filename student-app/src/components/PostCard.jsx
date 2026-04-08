import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width } = Dimensions.get('window');

function VideoPost({ uri }) {
  const player = useVideoPlayer(uri, (playerInstance) => {
    playerInstance.loop = false;
  });

  return (
    <VideoView
      style={styles.media}
      player={player}
      nativeControls
      contentFit="cover"
    />
  );
}

export default function PostCard({ post, navigation }) {
  const mediaUrl = post.media_url || '';
  const lowerUrl = mediaUrl.toLowerCase();

  const isVideo =
    lowerUrl.endsWith('.mp4') ||
    lowerUrl.endsWith('.mov') ||
    lowerUrl.endsWith('.webm');

  const handleJobPress = () => {
    navigation.navigate('JobDetail', { post });
  };

  const handleLinkPress = async () => {
    if (!post.ticket_link) return;

    const supported = await Linking.canOpenURL(post.ticket_link);
    if (supported) {
      await Linking.openURL(post.ticket_link);
    }
  };

  const getTypeColor = () => {
    if (post.type === 'job') return '#16a34a';
    if (post.type === 'event') return '#f59e0b';
    return '#001DAF';
  };

  return (
    <View style={styles.postContainer}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>C</Text>
        </View>

        <View>
          <Text style={styles.adminName}>Campus Admin</Text>
          <Text style={[styles.postType, { color: getTypeColor() }]}>
            {post.type.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* MEDIA */}
      {mediaUrl ? (
        isVideo ? (
          <VideoPost uri={mediaUrl} />
        ) : (
          <Image source={{ uri: mediaUrl }} style={styles.media} />
        )
      ) : (
        <View style={styles.mediaFallback}>
          <Text style={styles.fallbackText}>{post.title}</Text>
        </View>
      )}

      {/* CONTENT */}
      <View style={styles.captionArea}>
        <Text style={styles.captionTitle}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>

      {/* ACTIONS */}
      <View style={styles.actionsRow}>
        
        {post.type === 'job' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleJobPress}>
            <Text style={styles.primaryText}>Apply Now</Text>
          </TouchableOpacity>
        )}

        {post.type === 'event' && post.ticket_link && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleLinkPress}>
            <Text style={styles.secondaryText}>Get Tickets</Text>
          </TouchableOpacity>
        )}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#001DAF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  adminName: {
    fontWeight: '700',
  },

  postType: {
    fontSize: 12,
    marginTop: 2,
  },

  media: {
    width: width,
    height: width,
  },

  mediaFallback: {
    width: width,
    height: width,
    backgroundColor: '#001DAF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fallbackText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  captionArea: {
    padding: 12,
  },

  captionTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 5,
  },

  description: {
    color: '#374151',
  },

  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 10,
  },

  primaryBtn: {
    backgroundColor: '#001DAF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  primaryText: {
    color: '#fff',
    fontWeight: '600',
  },

  secondaryBtn: {
    backgroundColor: '#facc15',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  secondaryText: {
    color: '#000',
    fontWeight: '600',
  },
});