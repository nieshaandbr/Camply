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
    lowerUrl.endsWith('.webm') ||
    lowerUrl.endsWith('.m4v');

  const handlePrimaryAction = () => {
    if (post.type === 'job') {
      navigation.navigate('JobDetail', { post });
    }
  };

  const handleTicketPress = async () => {
    if (!post.ticket_link) return;

    const supported = await Linking.canOpenURL(post.ticket_link);
    if (supported) {
      await Linking.openURL(post.ticket_link);
    }
  };

  const getTypeMeta = () => {
    switch (post.type) {
      case 'job':
        return { label: 'JOB', color: '#16a34a' };
      case 'event':
        return { label: 'EVENT', color: '#E89338' };
      default:
        return { label: 'ANNOUNCEMENT', color: '#1D3E6E' };
    }
  };

  const typeMeta = getTypeMeta();

  return (
    <View style={styles.postContainer}>
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>C</Text>
        </View>

        <View style={styles.headerTextWrap}>
          <Text style={styles.adminName}>Campus Admin</Text>
          <Text style={[styles.postType, { color: typeMeta.color }]}>
            {typeMeta.label}
          </Text>
        </View>
      </View>

      {mediaUrl ? (
        isVideo ? (
          <VideoPost uri={mediaUrl} />
        ) : (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.media}
            resizeMode="cover"
          />
        )
      ) : (
        <View style={styles.mediaFallback}>
          <Text style={styles.fallbackText}>{post.title}</Text>
        </View>
      )}

      <View style={styles.captionArea}>
        <Text style={styles.captionTitle}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>

      <View style={styles.actionsRow}>
        {post.type === 'job' && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handlePrimaryAction}>
            <Text style={styles.primaryText}>Apply Now</Text>
          </TouchableOpacity>
        )}

        {post.type === 'event' && post.ticket_link && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleTicketPress}>
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
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eef2f7',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1D3E6E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  adminName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#111827',
  },
  postType: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '700',
  },
  media: {
    width: width,
    height: width,
    backgroundColor: '#000',
  },
  mediaFallback: {
    width: width,
    height: width,
    backgroundColor: '#1D3E6E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fallbackText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  captionArea: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  captionTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: '#111827',
  },
  description: {
    color: '#374151',
    lineHeight: 20,
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 16,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#1D3E6E',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#E89338',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  secondaryText: {
    color: '#fff',
    fontWeight: '700',
  },
});